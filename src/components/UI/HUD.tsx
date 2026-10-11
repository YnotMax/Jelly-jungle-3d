/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Pause, Sparkles, Gem, Flag } from 'lucide-react';
import { VisualMode } from '../../types/game';

interface HUDProps {
  timeSeconds: number;
  crystalsCollected: number;
  totalCrystals: number;
  currentIslandId: number;
  currentIslandName: string;
  totalIslands: number;
  jumpsRemaining: number;
  visualMode: VisualMode;
  onToggleVisualMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRespawn: () => void;
  onOpenHelp: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  timeSeconds,
  crystalsCollected,
  totalCrystals,
  currentIslandId,
  currentIslandName,
  totalIslands,
  jumpsRemaining,
  visualMode,
  onToggleVisualMode,
  isMuted,
  onToggleMute,
  onRespawn,
  onOpenHelp,
  onPause,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = (secs % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${rem.padStart(5, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 md:p-6 select-none">
      {/* Barra Superior do HUD */}
      <div className="flex items-start justify-between gap-3 pointer-events-auto">
        {/* Esquerda: Utilidades */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={onPause}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full glass-panel flex items-center justify-center text-emerald-950 hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Pausar Jogo"
            aria-label="Pausa"
          >
            <Pause className="w-4 h-4 md:w-5 md:h-5 fill-emerald-900" />
          </button>

          <button
            onClick={onToggleMute}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full glass-panel flex items-center justify-center text-emerald-950 hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
            title={isMuted ? 'Ativar Som' : 'Silenciar Som'}
            aria-label="Alternar Som"
          >
            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-amber-700" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-700" />}
          </button>

          <button
            onClick={onRespawn}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full glass-panel flex items-center justify-center text-emerald-950 hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Retornar ao Ponto de Controle (R)"
            aria-label="Renascer"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={onOpenHelp}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full glass-panel flex items-center justify-center text-emerald-950 hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Ajuda & Controles"
            aria-label="Ajuda"
          >
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Centro: Faixa da Ilha Atual */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full text-xs font-semibold text-emerald-950 shadow-sm">
          <Flag className="w-3.5 h-3.5 text-pink-600" />
          <span>Ilha {currentIslandId.toString().padStart(2, '0')}: {currentIslandName}</span>
          <span className="text-slate-300">·</span>
          <span className="text-emerald-700 font-mono">{currentIslandId}/{totalIslands}</span>
        </div>

        {/* Direita: Métricas & Seletor de Modo */}
        <div className="flex items-center gap-2">
          {/* Contador de Cristais */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 glass-panel rounded-full text-xs md:text-sm font-bold text-amber-900 shadow-sm">
            <Gem className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="font-mono tabular-nums">{crystalsCollected}/{totalCrystals}</span>
          </div>

          {/* Cronômetro */}
          <div className="px-3 py-1.5 glass-panel rounded-full text-xs md:text-sm font-mono font-bold text-emerald-950 shadow-sm tabular-nums">
            {formatTime(timeSeconds)}
          </div>

          {/* Seletor de Modo Visual */}
          <div className="hidden md:flex items-center gap-1 p-1 glass-panel rounded-full shadow-sm">
            <button
              onClick={onToggleVisualMode}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                visualMode === 'classic' ? 'bg-emerald-800 text-white shadow-xs' : 'text-emerald-900 hover:bg-white/50'
              }`}
            >
              Clássico
            </button>
            <button
              onClick={onToggleVisualMode}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                visualMode === 'tripo' ? 'bg-pink-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Tripo AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Faixa da Ilha no Mobile */}
      <div className="sm:hidden self-center pointer-events-auto">
        <div className="flex items-center gap-1.5 px-3 py-1 glass-panel rounded-full text-[11px] font-semibold text-emerald-950 shadow-xs">
          <span>Ilha {currentIslandId}/{totalIslands}: {currentIslandName}</span>
        </div>
      </div>

      {/* Medidor Inferior: 3 Segmentos de Salto */}
      <div className="self-center flex flex-col items-center gap-1.5 pb-2 pointer-events-auto">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 shadow-md border border-white/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
            Pulos
          </span>

          {/* 3 segmentos visíveis */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((segmentNum) => {
              const isFilled = segmentNum <= jumpsRemaining;
              return (
                <div
                  key={segmentNum}
                  className={`w-9 h-3.5 rounded-md transition-all duration-150 border ${
                    isFilled
                      ? segmentNum === 1
                        ? 'bg-emerald-500 border-emerald-600 shadow-xs shadow-emerald-500/50 scale-100'
                        : 'bg-pink-500 border-pink-600 shadow-xs shadow-pink-500/50 scale-100'
                      : 'bg-slate-200/80 border-slate-300/80 scale-95 opacity-50'
                  }`}
                  title={`Pulo ${segmentNum}`}
                />
              );
            })}
          </div>

          <span className="font-mono text-xs font-bold text-emerald-950">
            {jumpsRemaining}/3
          </span>
        </div>
      </div>
    </div>
  );
};
