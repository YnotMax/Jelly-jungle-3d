/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ArrowUp, Compass, Sparkles, AlertCircle } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/90 text-left flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-900/10 mb-5">
          <div>
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-emerald-950">
              COMO JOGAR
            </h2>
            <p className="text-xs text-slate-500 font-medium">Guia & Mecânicas de Jelly Jungle</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seções de conteúdo */}
        <div className="space-y-4 text-sm text-slate-700">
          {/* Seção 1: Movimento & Salto Triplo */}
          <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100/80">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2 mb-2">
              <ArrowUp className="w-4 h-4 text-pink-600" />
              <span>O Segredo do Pulo Triplo</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 mb-2">
              Você pode dar até <strong>3 pulos seguidos</strong>! O primeiro sai do chão e você tem mais dois no ar pra alcançar ilhas distantes e corrigir a rota. Encostou em qualquer plataforma, o medidor recarrega todinho.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-900 rounded-md font-semibold">WASD / Setas: Correr</span>
              <span className="px-2 py-1 bg-pink-100 text-pink-900 rounded-md font-semibold">Espaço / Toque: Pular</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-md font-semibold">R: Voltar pro Checkpoint</span>
            </div>
          </div>

          {/* Seção 2: Obstáculos & Recursos */}
          <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100/80">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Armadilhas & Recursos da Fase</span>
            </h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li>
                <strong>🍄 Cogumelos-Mola:</strong> Pise na capa pra ser arremessado nas alturas com impulso gigante! Recarrega os 3 pulos na hora.
              </li>
              <li>
                <strong>🍭 Pirulitos Giratórios:</strong> Cuidado com as barras varrendo a pista. Pule por cima pra não levar uma pancada!
              </li>
              <li>
                <strong>🪵 Ilhas que Andam:</strong> Elas deslizam pelo céu e levam você junto enquanto estiver sobre elas.
              </li>
              <li>
                <strong>⏳ Ilha que Desmancha:</strong> Ela treme assim que você pisa e cai em 1.5s! Atravesse rápido antes que ela suma!
              </li>
              <li>
                <strong>⛺ Checkpoints:</strong> Salvam o seu lugar na corrida caso caia lá embaixo nas nuvens.
              </li>
            </ul>
          </div>

          {/* Seção 3: Objetivos */}
          <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100/80">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>Estrelas da Fase & Objetivo</span>
            </h3>
            <p className="text-xs text-slate-600">
              Atravesse o percurso até o Portal Dourado na Ilha 13. Colete os cristais pelo caminho (3 por ilha, 39 no total):
            </p>
            <div className="mt-2 text-xs font-medium space-y-1 text-slate-700">
              <div>⭐⭐⭐ <strong>3 Estrelas:</strong> 30 cristais ou mais</div>
              <div>⭐⭐ <strong>2 Estrelas:</strong> 18 cristais ou mais</div>
              <div>⭐ <strong>1 Estrela:</strong> Só chegar no portal final</div>
            </div>
          </div>
        </div>

        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-bold rounded-2xl transition-all cursor-pointer"
        >
          Entendi, partiu!
        </button>
      </div>
    </div>
  );
};
