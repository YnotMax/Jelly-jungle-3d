/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Upload, Sparkles, CheckCircle, AlertCircle, Box } from 'lucide-react';
import { VisualMode } from '../../types/game';

interface ModelInspectorModalProps {
  onClose: () => void;
  visualMode: VisualMode;
  onSetVisualMode: (mode: VisualMode) => void;
  onImportGLTF: (file: File) => Promise<boolean>;
}

export const ModelInspectorModal: React.FC<ModelInspectorModalProps> = ({
  onClose,
  visualMode,
  onSetVisualMode,
  onImportGLTF,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImportStatus('Validando geometria da malha e limites do modelo...');

    const success = await onImportGLTF(file);
    setIsUploading(false);

    if (success) {
      setImportStatus('Modelo GLTF validado e carregado com sucesso no jogo!');
    } else {
      setImportStatus('Falha ao processar ou validar o GLTF. Mantendo o modelo ativo.');
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/90 text-left flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-900/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-emerald-950">
                INSPETOR DE MODELOS & ASSETS
              </h2>
              <p className="text-xs text-slate-500 font-medium">Pipeline de Renderização Clássico vs Tripo AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Modo */}
        <div className="space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            {/* Opção Clássico */}
            <div
              onClick={() => onSetVisualMode('classic')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                visualMode === 'classic'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                  : 'border-slate-200 bg-white/60 hover:bg-white/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-emerald-950">Modo Clássico</span>
                  {visualMode === 'classic' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Escultura macia procedural de vinil: broto de hortelã, corpo rosa doce e cogumelos com pintas de marfim.
                </p>
              </div>
              <span className="mt-3 text-[11px] font-mono text-emerald-800 font-semibold">Estado: Procedural Ativo</span>
            </div>

            {/* Opção Tripo AI */}
            <div
              onClick={() => onSetVisualMode('tripo')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                visualMode === 'tripo'
                  ? 'border-pink-500 bg-pink-50/70 shadow-sm'
                  : 'border-slate-200 bg-white/60 hover:bg-white/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <span className="font-bold text-pink-950">Modo Tripo AI</span>
                  </div>
                  {visualMode === 'tripo' && <CheckCircle className="w-4 h-4 text-pink-600" />}
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Shading estilizado aprimorado, brilho translúcido de vinil e suporte para importação de malhas GLTF customizadas.
                </p>
              </div>
              <span className="mt-3 text-[11px] font-mono text-pink-800 font-semibold">Estado: Estilizado Aprimorado</span>
            </div>
          </div>

          {/* Status do Registro */}
          <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100 text-xs space-y-2">
            <span className="font-bold text-emerald-950 block uppercase tracking-wider text-[11px]">
              Registro do Pipeline de Assets:
            </span>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">1. Personagem Jelly (1.65u)</span>
              <span className="font-mono text-emerald-700 font-bold">PRONTO (Pivô y=0)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">2. Cogumelo-Mola</span>
              <span className="font-mono text-emerald-700 font-bold">PRONTO (Impulso 16.0)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 font-medium">3. Família de Árvores Tropicais</span>
              <span className="font-mono text-emerald-700 font-bold">PRONTO (Balanço de Vento)</span>
            </div>
          </div>

          {/* Importador GLTF */}
          <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100">
            <span className="font-bold text-emerald-950 block mb-1 text-xs uppercase tracking-wider">
              Importar Modelo Customizado (.glb / .gltf):
            </span>
            <p className="text-xs text-slate-500 mb-3">
              Selecione um arquivo de personagem 3D GLTF para testar no percurso sem perder o progresso ou a física.
            </p>

            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-800">
                {isUploading ? 'Validando...' : 'Selecionar arquivo .glb ou .gltf'}
              </span>
              <input
                type="file"
                accept=".glb,.gltf"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileChange}
              />
            </label>

            {importStatus && (
              <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-700">
                <AlertCircle className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-bold rounded-2xl transition-all cursor-pointer"
        >
          Fechar Inspetor
        </button>
      </div>
    </div>
  );
};
