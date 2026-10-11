/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Volume2, VolumeX, HelpCircle, Eye } from 'lucide-react';
import { VisualMode } from '../../types/game';

interface IntroOverlayProps {
  onStart: () => void;
  visualMode: VisualMode;
  onToggleVisualMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHelp: () => void;
  onOpenModelInspector: () => void;
  bestTime: number | null;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  onStart,
  visualMode,
  onToggleVisualMode,
  isMuted,
  onToggleMute,
  onOpenHelp,
  onOpenModelInspector,
  bestTime,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = (secs % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${rem.padStart(5, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 md:p-8 select-none">
      {/* Barra superior de utilidades */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Alternar áudio */}
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-emerald-900 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            title={isMuted ? 'Ativar Som' : 'Silenciar Som'}
            aria-label="Controle de Som"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-amber-800" /> : <Volume2 className="w-5 h-5 text-emerald-700" />}
          </button>

          {/* Modal de ajuda */}
          <button
            onClick={onOpenHelp}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-emerald-900 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Controles & Instruções"
            aria-label="Ajuda"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Modo Visual (Clássico vs Tripo AI) */}
        <div className="flex items-center gap-1.5 p-1 glass-panel rounded-full shadow-sm pointer-events-auto">
          <button
            onClick={onToggleVisualMode}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              visualMode === 'classic'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-emerald-900 hover:bg-white/60'
            }`}
          >
            <span>Clássico</span>
          </button>
          <button
            onClick={onToggleVisualMode}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              visualMode === 'tripo'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-emerald-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tripo AI</span>
          </button>
          <button
            onClick={onOpenModelInspector}
            className="p-1.5 text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer rounded-full hover:bg-white/60"
            title="Inspetor de Modelos & Importador GLTF"
            aria-label="Inspetor de Modelos"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Enquadramento Principal: 35-40% à esquerda no Desktop, Acima no Mobile */}
      <div className="flex flex-col md:max-w-md lg:max-w-lg pointer-events-auto mt-auto md:my-auto pb-4 md:pb-0">
        <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-xl border border-white/80">
          {/* Subtítulo */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-800">
              Aventura nas Alturas em 3D
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-medium text-pink-600">13 Ilhas</span>
          </div>

          {/* Título Empilhado em Barlow Condensed */}
          <h1 className="font-display font-black text-6xl md:text-7xl lg:text-8xl leading-[0.88] tracking-tight text-emerald-950 uppercase mb-2">
            JELLY
            <br />
            <span className="text-pink-600">JUNGLE</span>
          </h1>

          {/* Slogan */}
          <p className="text-slate-700 text-base md:text-lg font-medium mb-6 leading-snug">
            Nascida pra quicar! Pule alto, pegue impulso nos cogumelos-mola e cruze as 13 ilhas nas alturas!
          </p>

          {/* Dica de Controles */}
          <div className="flex items-center gap-2 text-xs text-emerald-900/80 mb-6 bg-white/60 rounded-xl p-3 border border-emerald-100">
            <span className="font-bold text-emerald-950">Comandos:</span>
            <span>WASD / Setas pra Correr</span>
            <span className="text-slate-300">·</span>
            <span className="font-bold text-pink-700">Espaço / Toque pra Pular (3x)</span>
          </div>

          {/* Botão de Ação: "Bora Pular!" */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onStart}
              className="px-8 py-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-900/25 flex items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <span>Bora Pular!</span>
              <Play className="w-5 h-5 fill-white transition-transform group-hover:translate-x-0.5" />
            </button>

            {bestTime !== null && (
              <div className="text-xs font-medium text-emerald-900 px-4 py-2 bg-white/60 rounded-xl flex items-center justify-center">
                <span>Recorde: <strong className="font-mono text-emerald-950">{formatTime(bestTime)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé de Créditos */}
      <div className="flex items-center justify-between text-[11px] text-emerald-950/70 pointer-events-auto">
        <p className="font-medium">
          Reconstruído com Three.js · Inspirado em Jelly Jungle e Aditya
        </p>
        <span className="hidden sm:inline font-mono">Física Fixa 1/120s</span>
      </div>
    </div>
  );
};
