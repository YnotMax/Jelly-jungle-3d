/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, RotateCcw, Trophy, Gem, Clock, AlertTriangle } from 'lucide-react';

interface FinishModalProps {
  timeSeconds: number;
  crystalsCollected: number;
  totalCrystals: number;
  falls: number;
  bestTime: number | null;
  onPlayAgain: () => void;
}

export const FinishModal: React.FC<FinishModalProps> = ({
  timeSeconds,
  crystalsCollected,
  totalCrystals,
  falls,
  bestTime,
  onPlayAgain,
}) => {
  // Classificação de estrelas: 3 para >= 30, 2 para >= 18, 1 caso contrário
  const stars = crystalsCollected >= 30 ? 3 : crystalsCollected >= 18 ? 2 : 1;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = (secs % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${rem.padStart(5, '0')}`;
  };

  const isNewBest = bestTime === null || timeSeconds <= bestTime;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/90 text-center flex flex-col items-center">
        {/* Troféu de Celebração */}
        <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 mb-3 shadow-inner">
          <Trophy className="w-8 h-8 fill-amber-400 text-amber-600" />
        </div>

        <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight text-emerald-950 mb-1">
          FASE CONCLUÍDA!
        </h2>
        <p className="text-sm font-medium text-slate-600 mb-6">
          Você detonou no percurso e alcançou o Topo do Céu!
        </p>

        {/* Exibição de Estrelas */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((starNum) => (
            <div
              key={starNum}
              className={`p-2 rounded-2xl transition-transform ${
                starNum <= stars
                  ? 'bg-amber-400 text-white scale-110 shadow-md shadow-amber-400/40 rotate-1'
                  : 'bg-slate-200/80 text-slate-400 scale-95 opacity-60'
              }`}
            >
              <Star className={`w-8 h-8 ${starNum <= stars ? 'fill-amber-300 text-amber-700' : ''}`} />
            </div>
          ))}
        </div>

        {/* Grade de Estatísticas */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/70 rounded-2xl p-3 border border-emerald-100 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tempo</span>
            </div>
            <span className="font-mono font-black text-lg text-emerald-950 tabular-nums">
              {formatTime(timeSeconds)}
            </span>
          </div>

          <div className="bg-white/70 rounded-2xl p-3 border border-emerald-100 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Gem className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Cristais</span>
            </div>
            <span className="font-mono font-black text-lg text-emerald-950 tabular-nums">
              {crystalsCollected}/{totalCrystals}
            </span>
          </div>

          <div className="bg-white/70 rounded-2xl p-3 border border-emerald-100 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-pink-600" />
              <span>Quedas</span>
            </div>
            <span className="font-mono font-black text-lg text-emerald-950 tabular-nums">
              {falls}
            </span>
          </div>
        </div>

        {/* Nota de Recorde */}
        {isNewBest ? (
          <div className="mb-6 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
            🎉 Novo Recorde Pessoal!
          </div>
        ) : bestTime !== null ? (
          <div className="mb-6 text-xs text-slate-500 font-medium">
            Melhor Recorde: <span className="font-mono font-bold text-emerald-900">{formatTime(bestTime)}</span>
          </div>
        ) : null}

        {/* CTA: Jogar Novamente */}
        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-900/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Bora de Novo!</span>
        </button>
      </div>
    </div>
  );
};
