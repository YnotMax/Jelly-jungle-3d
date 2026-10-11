/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHelp: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
  onOpenHelp,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl border border-white/90 text-center flex flex-col items-center">
        <h2 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight text-emerald-950 mb-1">
          JOGO PAUSADO
        </h2>
        <p className="text-xs font-medium text-slate-500 mb-6">Respire fundo nas nuvens</p>

        <div className="w-full space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Voltar pro Jogo</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-white/70 hover:bg-white active:scale-[0.98] text-emerald-950 font-bold text-sm rounded-2xl border border-emerald-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recomeçar Fase</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onToggleMute}
              className="py-2.5 bg-white/60 hover:bg-white active:scale-[0.98] text-emerald-950 font-semibold text-xs rounded-xl border border-emerald-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
              <span>{isMuted ? 'Mudo' : 'Com Som'}</span>
            </button>

            <button
              onClick={onOpenHelp}
              className="py-2.5 bg-white/60 hover:bg-white active:scale-[0.98] text-emerald-950 font-semibold text-xs rounded-xl border border-emerald-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-800" />
              <span>Controles</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
