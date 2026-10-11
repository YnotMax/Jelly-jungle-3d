/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WorldManager } from '../game/world';
import { PhysicsEngine } from '../game/physics';
import { generateCourseCrystals } from '../game/crystals';
import { CrystalData, VisualMode } from '../types/game';
import { ISLANDS } from '../game/constants';
import { IntroOverlay } from './UI/IntroOverlay';
import { HUD } from './UI/HUD';
import { TouchControls } from './UI/TouchControls';
import { FinishModal } from './UI/FinishModal';
import { PauseModal } from './UI/PauseModal';
import { HelpModal } from './UI/HelpModal';
import { ModelInspectorModal } from './UI/ModelInspectorModal';
import { sounds } from '../audio/SoundEffects';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Objetos principais do jogo
  const worldRef = useRef<WorldManager | null>(null);
  const physicsRef = useRef<PhysicsEngine | null>(null);
  const crystalsRef = useRef<CrystalData[]>([]);
  const animFrameId = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Estados de entrada do teclado
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Multi-Touch Input Handler: Rastreamento independente de ponteiros distintos
  const movePointerId = useRef<number | null>(null);
  const jumpPointerId = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchInput = useRef<{ moveX: number; moveZ: number }>({ moveX: 0, moveZ: 0 });

  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const [isJumpActive, setIsJumpActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Estados do Jogo
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'paused' | 'finish'>('intro');
  const gameStateRef = useRef<'intro' | 'playing' | 'paused' | 'finish'>('intro');

  const setGameStateSafe = useCallback(
    (newState: 'intro' | 'playing' | 'paused' | 'finish' | ((prev: 'intro' | 'playing' | 'paused' | 'finish') => 'intro' | 'playing' | 'paused' | 'finish')) => {
      setGameState((prev) => {
        const next = typeof newState === 'function' ? newState(prev) : newState;
        gameStateRef.current = next;
        return next;
      });
    },
    []
  );

  const [visualMode, setVisualMode] = useState<VisualMode>('classic');
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());
  const [showHelp, setShowHelp] = useState(false);
  const [showModelInspector, setShowModelInspector] = useState(false);

  // Métricas ao vivo
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [crystalsCollected, setCrystalsCollected] = useState(0);
  const [currentIslandId, setCurrentIslandId] = useState(1);
  const currentIslandIdRef = useRef(1);
  const [currentIslandName, setCurrentIslandName] = useState('Salto Inicial');
  const [jumpsRemaining, setJumpsRemaining] = useState(3);
  const lastJumpsRef = useRef(3);
  const lastTimeUpdateRef = useRef(0);
  const [fallCount, setFallCount] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('jelly_jungle_best_time');
    return saved ? parseFloat(saved) : null;
  });

  // Cálculo da posição e vetor do joystick a partir das coordenadas do ponteiro
  const updateJoystickCoordinates = useCallback((clientX: number, clientY: number) => {
    const maxRadius = 45;
    const dx = clientX - joystickCenterRef.current.x;
    const dy = clientY - joystickCenterRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= 0.001) {
      setKnobOffset({ x: 0, y: 0 });
      touchInput.current = { moveX: 0, moveZ: 0 };
      return;
    }

    let normX = dx / maxRadius;
    let normZ = dy / maxRadius; // dy < 0 puxa para cima (avança para frente em -Z)

    let displayX = dx;
    let displayY = dy;
    if (dist > maxRadius) {
      const angle = Math.atan2(dy, dx);
      displayX = Math.cos(angle) * maxRadius;
      displayY = Math.sin(angle) * maxRadius;
      normX = Math.cos(angle);
      normZ = Math.sin(angle);
    }

    setKnobOffset({ x: displayX, y: displayY });
    touchInput.current = { moveX: normX, moveZ: normZ };
  }, []);

  // Multi-Touch Handlers para o Joystick
  const handleJoystickPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      // Não sobrescreve se já houver um ponteiro de movimento ativo
      if (movePointerId.current !== null) return;

      movePointerId.current = e.pointerId;
      setIsJoystickActive(true);

      const rect = e.currentTarget.getBoundingClientRect();
      joystickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      updateJoystickCoordinates(e.clientX, e.clientY);
    },
    [updateJoystickCoordinates]
  );

  // Multi-Touch Handlers para o Botão de Salto
  const handleJumpPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (jumpPointerId.current !== null) return;

    jumpPointerId.current = e.pointerId;
    setIsJumpActive(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }

    // Aciona o salto imediatamente sem interferir no ponteiro de movimento
    if (physicsRef.current) {
      physicsRef.current.triggerJump();
    }
  }, []);

  // Ouvintes globais de ponteiro para rastreamento suave e independente de múltiplos toques
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (e.pointerId === movePointerId.current) {
        updateJoystickCoordinates(e.clientX, e.clientY);
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      // Libera ponteiro do joystick
      if (e.pointerId === movePointerId.current) {
        movePointerId.current = null;
        setIsJoystickActive(false);
        setKnobOffset({ x: 0, y: 0 });
        touchInput.current = { moveX: 0, moveZ: 0 };
      }
      // Libera ponteiro do salto
      if (e.pointerId === jumpPointerId.current) {
        jumpPointerId.current = null;
        setIsJumpActive(false);
        if (physicsRef.current) {
          physicsRef.current.handleJumpInput(false);
        }
      }
    };

    const handleGlobalPointerCancel = (e: PointerEvent) => {
      handleGlobalPointerUp(e);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: false });
    window.addEventListener('pointerup', handleGlobalPointerUp, { passive: false });
    window.addEventListener('pointercancel', handleGlobalPointerCancel, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerCancel);
    };
  }, [updateJoystickCoordinates]);

  // Detecção de toque/mobile
  useEffect(() => {
    const checkTouch = () => {
      if (
        'ontouchstart' in window ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        window.innerWidth <= 1024
      ) {
        setIsTouchDevice(true);
      }
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Inicialização da Cena 3D e Física
  useEffect(() => {
    if (!containerRef.current) return;

    // Gerar cristais
    crystalsRef.current = generateCourseCrystals();

    // Física
    const physics = new PhysicsEngine();
    physicsRef.current = physics;

    // Callbacks do mundo
    const callbacks = {
      onCrystalCollected: (count: number) => {
        setCrystalsCollected(count);
      },
      onIslandChange: (id: number, name: string) => {
        setCurrentIslandId(id);
        setCurrentIslandName(name);
      },
    };

    const world = new WorldManager(containerRef.current, callbacks);
    worldRef.current = world;
    world.populateCrystals(crystalsRef.current);

    // Callbacks da física
    physics.onFinish = () => {
      setGameStateSafe('finish');
      const finalTime = physics.timeElapsed;
      const currentBest = localStorage.getItem('jelly_jungle_best_time');
      if (!currentBest || finalTime < parseFloat(currentBest)) {
        localStorage.setItem('jelly_jungle_best_time', finalTime.toString());
        setBestTime(finalTime);
      }
    };

    physics.onFall = (falls: number) => {
      setFallCount(falls);
    };

    physics.onCheckpoint = (islandId: number) => {
      const island = ISLANDS.find((i) => i.id === islandId);
      if (island) {
        setCurrentIslandId(island.id);
        setCurrentIslandName(island.name);
      }
    };

    // Eventos do teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        physics.handleJumpInput(true);
      }

      if (e.code === 'KeyR') {
        physics.respawnAtCheckpoint(true);
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameStateSafe((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;

      if (e.code === 'Space') {
        physics.handleJumpInput(false);
      }
    };

    const handleBlur = () => {
      keysPressed.current = {};
      touchInput.current = { moveX: 0, moveZ: 0 };
      movePointerId.current = null;
      jumpPointerId.current = null;
      setIsJoystickActive(false);
      setIsJumpActive(false);
      physics.handleJumpInput(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // Redimensionamento de tela
    const handleResize = () => {
      if (!containerRef.current || !worldRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      worldRef.current.onResize(width, height);
      if (worldRef.current.isIntroMode) {
        worldRef.current.setIntroCamera(width <= 640);
      }
    };

    window.addEventListener('resize', handleResize);

    // Loop de Animação e Física Fixa
    clockRef.current.start();
    const loop = () => {
      const delta = Math.min(clockRef.current.getDelta(), 0.05);

      if (physicsRef.current && worldRef.current) {
        // Coleta entradas combinadas de teclado e touch
        let moveX = 0;
        let moveZ = 0;

        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveZ -= 1;
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveZ += 1;
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveX -= 1;
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveX += 1;

        if (touchInput.current.moveX !== 0 || touchInput.current.moveZ !== 0) {
          moveX += touchInput.current.moveX;
          moveZ += touchInput.current.moveZ;
        }

        // Atualização contínua durante o jogo
        if (gameStateRef.current === 'playing') {
          physicsRef.current.update(delta, moveX, moveZ);

          // Atualiza tempo de forma otimizada (~15fps para React HUD, mantendo 120fps fluido na física)
          const now = performance.now();
          if (now - lastTimeUpdateRef.current > 66) {
            lastTimeUpdateRef.current = now;
            setTimeSeconds(physicsRef.current.timeElapsed);
          }

          // Só atualiza jumpsRemaining no React se mudou de fato
          const curJumps = physicsRef.current.player.jumpsRemaining;
          if (curJumps !== lastJumpsRef.current) {
            lastJumpsRef.current = curJumps;
            setJumpsRemaining(curJumps);
          }

          const groundedId = physicsRef.current.player.groundIslandId;
          if (groundedId && groundedId !== currentIslandIdRef.current) {
            currentIslandIdRef.current = groundedId;
            setCurrentIslandId(groundedId);
            const isl = ISLANDS.find((i) => i.id === groundedId);
            if (isl) {
              setCurrentIslandName(isl.name);
            }
          }
        }

        // Renderização da cena Three.js
        worldRef.current.update(physicsRef.current, crystalsRef.current, delta);
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
      world.dispose();
    };
  }, []);

  // Controles de Modo e Áudio
  const toggleVisualMode = useCallback(() => {
    const nextMode = visualMode === 'classic' ? 'tripo' : 'classic';
    setVisualMode(nextMode);
    if (worldRef.current) {
      worldRef.current.setVisualMode(nextMode);
    }
  }, [visualMode]);

  const toggleMute = useCallback(() => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Controles do Percurso
  const startCourse = useCallback(() => {
    setGameStateSafe('playing');
    if (worldRef.current) {
      worldRef.current.isIntroMode = false;
    }
  }, [setGameStateSafe]);

  const restartCourse = useCallback(() => {
    if (physicsRef.current) {
      physicsRef.current.resetCourse();
    }
    crystalsRef.current = generateCourseCrystals();
    if (worldRef.current) {
      worldRef.current.populateCrystals(crystalsRef.current);
      worldRef.current.isIntroMode = false;
    }
    setCrystalsCollected(0);
    currentIslandIdRef.current = 1;
    setCurrentIslandId(1);
    setCurrentIslandName('Salto Inicial');
    setFallCount(0);
    setTimeSeconds(0);
    setJumpsRemaining(3);
    touchInput.current = { moveX: 0, moveZ: 0 };
    setKnobOffset({ x: 0, y: 0 });
    movePointerId.current = null;
    jumpPointerId.current = null;
    setIsJoystickActive(false);
    setIsJumpActive(false);
    setGameStateSafe('playing');
  }, [setGameStateSafe]);

  const handleRespawn = useCallback(() => {
    if (physicsRef.current) {
      physicsRef.current.respawnAtCheckpoint(true);
    }
  }, []);

  const handleImportGLTF = useCallback(async (file: File) => {
    if (!worldRef.current) return false;
    const success = await worldRef.current.loadCustomGLTF(file);
    if (success) {
      setVisualMode('tripo');
    }
    return success;
  }, []);

  const isMobileOrTouch =
    isTouchDevice ||
    (typeof window !== 'undefined' &&
      ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || window.innerWidth <= 1024));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#c7ebec] select-none touch-none">
      {/* Visualizador WebGL 3D */}
      <div ref={containerRef} className="w-full h-full game-canvas-container touch-none" />

      {/* Tela Inicial */}
      {gameState === 'intro' && (
        <IntroOverlay
          onStart={startCourse}
          visualMode={visualMode}
          onToggleVisualMode={toggleVisualMode}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onOpenHelp={() => setShowHelp(true)}
          onOpenModelInspector={() => setShowModelInspector(true)}
          bestTime={bestTime}
        />
      )}

      {/* HUD da Corrida */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <HUD
          timeSeconds={timeSeconds}
          crystalsCollected={crystalsCollected}
          totalCrystals={39}
          currentIslandId={currentIslandId}
          currentIslandName={currentIslandName}
          totalIslands={ISLANDS.length}
          jumpsRemaining={jumpsRemaining}
          visualMode={visualMode}
          onToggleVisualMode={toggleVisualMode}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onRespawn={handleRespawn}
          onOpenHelp={() => setShowHelp(true)}
          onPause={() => setGameStateSafe('paused')}
        />
      )}

      {/* Controles de Toque Multi-Touch (Disponíveis em mobile/telas de toque durante o jogo) */}
      {gameState === 'playing' && isMobileOrTouch && (
        <TouchControls
          knobOffset={knobOffset}
          isJoystickActive={isJoystickActive}
          isJumpActive={isJumpActive}
          onJoystickPointerDown={handleJoystickPointerDown}
          onJumpPointerDown={handleJumpPointerDown}
        />
      )}

      {/* Modal de Conclusão */}
      {gameState === 'finish' && (
        <FinishModal
          timeSeconds={timeSeconds}
          crystalsCollected={crystalsCollected}
          totalCrystals={39}
          falls={fallCount}
          bestTime={bestTime}
          onPlayAgain={restartCourse}
        />
      )}

      {/* Modal de Pausa */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameStateSafe('playing')}
          onRestart={restartCourse}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onOpenHelp={() => setShowHelp(true)}
        />
      )}

      {/* Modal de Ajuda / Como Jogar */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Modal do Inspetor de Modelos & Assets */}
      {showModelInspector && (
        <ModelInspectorModal
          onClose={() => setShowModelInspector(false)}
          visualMode={visualMode}
          onSetVisualMode={(mode) => {
            setVisualMode(mode);
            worldRef.current?.setVisualMode(mode);
          }}
          onImportGLTF={handleImportGLTF}
        />
      )}
    </div>
  );
};
