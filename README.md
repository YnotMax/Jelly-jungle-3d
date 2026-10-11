# 🍓 Jelly Jungle

> **Uma aventura 3D de plataforma nas nuvens** construída com **React 19**, **Three.js**, **Vite** e **Tailwind CSS**. Salte por 13 ilhas celestiais flutuantes, domine o pulo triplo, pegue impulso em cogumelos-mola e chegue ao Portal Dourado no Topo do Céu!

---

## 🎮 Destaques do Jogo

- **Mecânica de Pulo Triplo**: 1 salto inicial a partir do chão + 2 saltos adicionais no ar para manobras e correções de trajetória.
- **13 Ilhas Celestiais Únicas**:
  1. *Salto Inicial* — Ponto de partida com arco de largada.
  2. *Na Maciota* — Plataforma de aquecimento com cristais.
  3. *Impulso do Cogumelo* — Cogumelo-mola com super-impulso vertical.
  4. *Pirulito Giratório* — Obstáculo com barra giratória varrendo a pista.
  5. *Ninho das Nuvens* — Primeiro Ponto de Controle (Checkpoint).
  6. *Ilha Voadora* — Plataforma móvel oscilando no céu.
  7. *Quica Mais!* — Cogumelo-mola de alta altitude.
  8. *Roda-Roda Maluco* — Obstáculo duplo com barras em rotação.
  9. *Pouso Estelar* — Segundo Ponto de Controle com vista panorâmica.
  10. *Pisa e Corre!* — Plataforma que desmancha 1.5s após o contato.
  11. *Travessia Nebulosa* — Plataforma móvel nas camadas altas.
  12. *O Grande Salto* — Cogumelo-mola para o salto final.
  13. *Topo do Céu* — Ilha da vitória com Portal Dourado em vórtice.
- **Animações Procedurais & Squash/Stretch**: Animação física responsiva de impacto, balanço alegre na corrida (*waddle*), bracinhos sincronizados, broto de hortelã oscilante e piscadas naturais.
- **Controles Multi-Touch para Mobile**: Joystick virtual dinâmico e botão de pulo dedicados com suporte a toques simultâneos com dois dedos.
- **Sintetizador Web Audio API Nativo**: Efeitos sonoros procedurais leves sem dependência de arquivos de áudio externos (sons de pulo em harmonia, impacto macio, cogumelo-mola, coleta de cristal e vitória).
- **Física Fixa em 1/120s**: Motor de física desacoplado da taxa de quadros para jogabilidade consistente em 60fps, 120fps ou 144fps.

---

## 🕹️ Controles

| Ação | Teclado (Desktop) | Celular / Tablet (Touch) |
|---|---|---|
| **Mover / Correr** | `W, A, S, D` ou `Setas` | Joystick virtual analógico (esquerda) |
| **Salto Triplo (3x)** | `Barra de Espaço` | Botão rosa "PULAR" (direita) |
| **Voltar ao Checkpoint** | `R` | Botão de renascer no topo da tela |
| **Pausar** | `Esc` / Botão de pausa | Botão de pausa (topo esquerdo) |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- npm, yarn, pnpm ou bun

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/jelly-jungle.git

# 2. Acesse a pasta do projeto
cd jelly-jungle

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Abra no navegador
# http://localhost:3000
```

Para gerar a versão otimizada de produção:
```bash
npm run build
npm run preview
```

---

## 📦 Como Subir para o GitHub

Se você já inicializou o repositório ou vai criar um novo no GitHub:

```bash
# 1. Adicione todos os arquivos e faça o commit inicial
git add .
git commit -m "feat: versão inicial do Jelly Jungle pronta para produção"

# 2. Conecte ao seu repositório no GitHub (crie um repo vazio no github.com)
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# 3. Envie para o branch main
git branch -M main
git push -u origin main
```

---

## ⚡ Como Fazer Deploy na Vercel

O projeto já inclui o arquivo `vercel.json` configurado para Vite SPA.

### Opção 1: Pelo Painel Web da Vercel (Recomendado)
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório **jelly-jungle** recém-enviado.
4. A Vercel detectará automaticamente o framework como **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Clique em **"Deploy"**. Em menos de 1 minuto seu jogo estará online!

### Opção 2: Pela Linha de Comando (Vercel CLI)
```bash
# Instale o CLI da Vercel globalmente ou use npx
npx vercel

# Para deploy direto em produção:
npx vercel --prod
```

---

## 📁 Estrutura do Projeto

```
├── .gitignore               # Ignora node_modules, dist, .vercel, etc.
├── vercel.json              # Configuração de redirecionamento SPA da Vercel
├── package.json             # Dependências e scripts do projeto
├── tsconfig.json            # Configuração do TypeScript
├── vite.config.ts           # Configuração do Vite e Tailwind CSS
├── index.html               # Ponto de entrada HTML com metatags otimizadas
└── src/
    ├── audio/
    │   └── SoundEffects.ts  # Sintetizador procedural Web Audio API
    ├── components/
    │   ├── GameCanvas.tsx   # Canvas 3D e loop principal do jogo
    │   └── UI/              # Interfaces HUD, Modais e Controles Touch
    │       ├── FinishModal.tsx
    │       ├── HelpModal.tsx
    │       ├── HUD.tsx
    │       ├── IntroOverlay.tsx
    │       ├── ModelInspectorModal.tsx
    │       ├── PauseModal.tsx
    │       └── TouchControls.tsx
    ├── game/
    │   ├── constants.ts     # Configurações de física, cores e ilhas
    │   ├── crystals.ts      # Posicionamento dos cristais
    │   ├── models.ts        # Modelos procedurais 3D em Three.js
    │   ├── physics.ts       # Motor de física 1/120s (saltos, colisões)
    │   └── world.ts         # Gerenciamento da cena, iluminação e câmera
    ├── types/
    │   └── game.ts          # Definições de tipos TypeScript
    ├── index.css            # Estilos globais e Tailwind v4
    └── main.tsx             # Ponto de montagem React
```

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **Three.js** (WebGL 3D Rendering & PCFSoftShadowMap)
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Web Audio API**

---

Divirta-se jogando e bom deploy! 🎉
