/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export interface TouchControlsProps {
  knobOffset: { x: number; y: number };
  isJoystickActive: boolean;
  isJumpActive: boolean;
  onJoystickPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onJumpPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  knobOffset,
  isJoystickActive,
  isJumpActive,
  onJoystickPointerDown,
  onJumpPointerDown,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-4 md:bottom-8 pointer-events-none z-30 flex items-end justify-between px-4 md:px-10 select-none touch-none">
      {/* Joystick Virtual (Lado Esquerdo) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 touch-none">
        <div
          onPointerDown={onJoystickPointerDown}
          className={`w-32 h-32 md:w-36 md:h-36 rounded-full glass-panel flex items-center justify-center relative touch-none cursor-grab active:cursor-grabbing border-2 transition-colors ${
            isJoystickActive ? 'border-emerald-500 bg-white/80 shadow-emerald-500/20' : 'border-white/80 shadow-lg'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Indicadores de direção */}
          <ArrowUp className="absolute top-2.5 w-4 h-4 text-emerald-800/40 pointer-events-none" />
          <ArrowDown className="absolute bottom-2.5 w-4 h-4 text-emerald-800/40 pointer-events-none" />
          <ArrowLeft className="absolute left-2.5 w-4 h-4 text-emerald-800/40 pointer-events-none" />
          <ArrowRight className="absolute right-2.5 w-4 h-4 text-emerald-800/40 pointer-events-none" />

          {/* Anel central */}
          <div className="w-16 h-16 rounded-full border border-emerald-900/15 pointer-events-none" />

          {/* Manípulo do Joystick */}
          <div
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center pointer-events-none transition-transform duration-75 border-2 border-white/90 ${
              isJoystickActive
                ? 'bg-emerald-700 text-white scale-105 shadow-emerald-900/40'
                : 'bg-emerald-800/90 text-white/80'
            }`}
            style={{
              transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/70" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-950/70 uppercase tracking-widest pointer-events-none">
          Andar
        </span>
      </div>

      {/* Botão de Salto (Lado Direito) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 touch-none">
        <button
          onPointerDown={onJumpPointerDown}
          className={`w-28 h-28 md:w-32 md:h-32 rounded-full font-black text-2xl uppercase tracking-wider text-white shadow-2xl flex flex-col items-center justify-center border-4 border-white transition-all cursor-pointer touch-none active:scale-95 ${
            isJumpActive
              ? 'bg-pink-700 scale-95 shadow-inner ring-4 ring-pink-300'
              : 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/35 active:bg-pink-700'
          }`}
          style={{ touchAction: 'none' }}
          aria-label="Botão de Salto"
        >
          <span className="leading-none text-2xl font-display">PULAR</span>
          <span className="text-[11px] font-mono font-medium text-pink-100 opacity-90 mt-0.5">3X</span>
        </button>
        <span className="text-[10px] font-bold text-emerald-950/70 uppercase tracking-widest pointer-events-none">
          Salto Triplo
        </span>
      </div>
    </div>
  );
};
