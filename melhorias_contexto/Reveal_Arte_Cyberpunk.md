# REVEAL - ARTE CYBERPUNK: CEREBRO MINDRESET

> Documento de instrucoes completo para criacao da animacao do cerebro cyberpunk
> representando os 4 arquetipos do MindReset.

---

## 1. RESUMO EXECUTIVO

**Objetivo:** Criar uma animacao ultra-premium de um cerebro cyberpunk que represente os 4 arquetipos do MindReset (AO, SS, EA, HI), usando as cores definidas para cada um, com fundo transparente para integracao a atmosfera existente do projeto.

**Entregaveis:**
- 2 prompts para geracao de imagens (frame inicial + frame final)
- 1 prompt para animacao entre os frames
- Guia de geracao de video
- Componente React para integracao
- CSS filters para personalizacao por arquetipo

**Ferramentas Recomendadas:**
- Geracao de imagens: **Midjourney v6** ou **DALL-E 3**
- Geracao de video: **Runway Gen-3 Alpha** ou **Pika Labs** ou **Luma Dream Machine**

---

## 2. CONCEITO VISUAL

### O que e o MindReset?
O MindReset e um SaaS de financas comportamentais que ajuda o usuario a **resetar sua mentalidade financeira**. O cerebro cyberpunk simboliza essa transformacao: de uma mentalidade limitante (antes) para uma mentalidade poderosa e conectada (depois).

### O que o cerebro representa?
- **Transformacao neural:** Conexoes sendo refeitas, novos caminhos se formando
- **Tecnologia + Filosofia:** Cerebro high-tech com elementos classicos (marmore, colunas gregas)
- **Psicologia profunda:** Detalhes que remetem a mente humana, comportamento, decisoes
- **Os 4 arquetipos:** Fios de energia nas cores de cada arquetipo pulsando atraves do cerebro

### Sensacao que deve transmitir:
- **Poder:** "Esse cerebro esta sendo transformado"
- **Misterio:** "Tem algo profundo acontecendo aqui"
- **Premium:** "Isso foi feito por uma equipe de 500 engenheiros"
- **Unico:** "Nunca vi nada assim antes"

---

## 3. PROMPTS PARA GERACAO DE IMAGENS

### 3.1. PROMPT 1 - FRAME INICIAL (Estado "Antes do Reset")

A hyper-detailed cyberpunk brain floating in void, dark psychological atmosphere. The brain is made of translucent crystalline material with visible neural pathways glowing faintly inside. The surface shows a mix of organic brain texture and circuit board patterns - neural synapses replaced by microchips, cerebellum folds morphing into PCB traces. Four distinct energy streams flow through the brain, each representing a different psychological archetype: LEFT HEMISPHERE TOP: Deep petrol blue (#0F4C5C) energy streams - cold, controlled, methodical. These streams are thick, rigid, almost mechanical. They represent obsessive accumulation and fear of scarcity. Small shield-like micro-structures form along the pathways. RIGHT HEMISPHERE TOP: Rich imperial purple (#7C3AED) energy streams - opulent, flowing, almost royal. These streams are wider, more decorative, with tiny crown-like nodes. They represent status-seeking and social approval patterns. LEFT HEMISPHERE BOTTOM: Muted slate grey (#64748B) energy streams - foggy, diffuse, almost dissolving. These streams are thin, fragmented, disappearing into mist. They represent avoidance and emotional disconnection from finances. RIGHT HEMISPHERE BOTTOM: Vibrant orange (#F97316) energy streams - hot, pulsating, energetic. These streams are chaotic, branching wildly with sparks flying off. They represent impulsive hedonism and living in the moment. The brain is embedded in fragments of ancient Greek marble columns - cracked pedestals and broken entablatures floating around it. The marble has a dark patina with subtle gold veins. These classical elements represent philosophy, wisdom, and the stoic foundations of behavioral change. Microscopic code fragments (Python, JavaScript symbols) float around the brain like digital dust. Tiny binary sequences, mathematical symbols, and financial icons are scattered throughout. The background is completely black/transparent. The lighting is dramatic - a single cold light source from above creating deep shadows and bright highlights on the brain surface. Volumetric light rays pierce through the neural pathways. Style: Ultra-realistic, cinematic, dark academia meets cyberpunk. Shot on ARRI Alexa 65, 8K resolution, f/1.4 shallow depth of field. The image should feel like a still from a Christopher Nolan film meets Blade Runner 2049. Mood: Tension, anticipation, something about to change. The brain is in a state of dormant potential - powerful but not yet activated. NO TEXT. NO WATERMARKS. NO BORDERS. PURE VISUAL ART.

**Parametros para Midjourney:** `/imagine [prompt acima] --ar 16:9 --v 6 --style raw --q 2 --s 750`

**Parametros para DALL-E 3:** Size: 1792x1024 (landscape), Quality: HD, Style: Natural

---

### 3.2. PROMPT 2 - FRAME FINAL (Estado "Depois do Reset")

A hyper-detailed cyberpunk brain floating in void, NOW FULLY ACTIVATED and transformed. The same crystalline brain from before, but now it is ALIVE with energy. The neural pathways are blazing with light - each of the four energy streams has been BALANCED and HARMONIZED: LEFT HEMISPHERE TOP: Petrol blue (#0F4C5C) streams now flow smoothly, no longer rigid. They pulse with controlled power - discipline without obsession. The shield micro-structures have opened into protective halos. RIGHT HEMISPHERE TOP: Imperial purple (#7C3AED) streams now radiate outward in elegant patterns - confidence without vanity. The crown nodes have blossomed into radiant stars. LEFT HEMISPHERE BOTTOM: Slate grey (#64748B) streams have become clear and visible - awareness without avoidance. The mist has solidified into visible neural connections. RIGHT HEMISPHERE BOTTOM: Orange (#F97316) streams now flow in controlled bursts - passion without chaos. The sparks have organized into a constellation pattern. All four streams now INTERCONNECT - tiny bridges of white-gold light connect the four quadrants, showing psychological integration. The brain is no longer divided - it is a unified system. The Greek marble fragments around the brain are now RECONSTRUCTED - broken pieces floating back together, glowing with internal light. The marble has transformed from dark patina to luminous white-gold, representing wisdom achieved. The code fragments and financial symbols now orbit the brain in organized patterns - like electrons around a nucleus. They form a halo of knowledge and behavioral awareness. A subtle RED GLOW (#CC0000 - MindReset accent color) pulses from the center of the brain - the power button of transformation. This is the core of the reset. Lighting has shifted: now multiple light sources create a dramatic rim light effect. The brain glows from within. Volumetric light rays now emanate OUTWARD from the brain, casting dramatic shadows on the marble fragments. Style: Ultra-realistic, cinematic, dark academia meets cyberpunk meets renaissance. Shot on ARRI Alexa 65, 8K resolution, f/2.0 deep focus. The image should feel like a still from a Terrence Malick film meets Ghost in the Shell. Mood: Power achieved, transformation complete, quiet confidence. The brain is in a state of activated potential - powerful AND directed. NO TEXT. NO WATERMARKS. NO BORDERS. PURE VISUAL ART.

**Parametros para Midjourney:** `/imagine [prompt acima] --ar 16:9 --v 6 --style raw --q 2 --s 750`

**Parametros para DALL-E 3:** Size: 1792x1024 (landscape), Quality: HD, Style: Natural

---

### 3.3. PROMPT 3 - ANIMACAO ENTRE OS FRAMES

A seamless morphing animation from a dormant cyberpunk brain to an activated one. STARTING STATE: A crystalline cyberpunk brain floating in void, neural pathways glowing faintly with four distinct colored energy streams (petrol blue, imperial purple, slate grey, orange). Greek marble fragments float around it in darkness. Code symbols drift like dust. The brain is in tension, dormant, potential energy waiting. ENDING STATE: The same brain now BLAZING with integrated energy. All four streams connected by bridges of white-gold light. Marble fragments reconstructed and glowing. Code organized into orbital patterns. A red pulse emanates from the core. The brain radiates power and transformation. THE ANIMATION SEQUENCE: 1. First 20%: The four energy streams begin to PULSE independently - blue rigid, purple flowing, grey flickering, orange sparking. Each has its own rhythm. 2. 20-40%: The streams start to EXTEND toward each other - reaching across the brain hemispheres. The marble fragments begin to vibrate and shift. 3. 40-60%: The streams CONNECT - bridges of white-gold light form between the four quadrants. The brain surface ripples with energy. Marble fragments start floating back toward reconstruction. 4. 60-80%: The brain TRANSFORMS - internal glow intensifies, neural pathways become visible as light networks. The marble fragments click into place, glowing from within. Code symbols begin organizing. 5. 80-100%: FULL ACTIVATION - all streams integrated, marble reconstructed, red pulse from center, volumetric light rays emanating outward. The brain reaches its final powerful state. CAMERA MOVEMENT: Slow orbit (270 degrees) around the brain during the transformation. Starting from a 3/4 front angle, orbiting to show all sides, ending at a dramatic low angle looking up at the activated brain. STYLE: Ultra-realistic, cinematic, 8K, smooth 60fps motion. The morphing should feel ORGANIC - like watching a flower bloom in time-lapse, but for neural transformation. NO TEXT. NO WATERMARKS. NO BORDERS. PURE VISUAL ART.

**Parametros Runway Gen-3:** Duration: 10s, Resolution: 1280x720, Motion: Low, Guidance Scale: 7-8

**Parametros Pika Labs:** Aspect Ratio: 16:9, Duration: 4s (gerar 3 clips e juntar), Motion: Moderate, Negative prompt: "text, watermark, border, blurry, low quality"

**Parametros Luma Dream Machine:** Aspect Ratio: 16:9, Duration: 5s, Camera: Orbit slowly, Style: Cinematic

---

## 4. ESPECIFICACOES TECNICAS

### 4.1. Formato do Video

| Propriedade | Valor | Notas |
|-------------|-------|-------|
| Formato | WebM | Com alpha channel (fundo transparente) |
| Codec | VP9 | Melhor compressao para WebM |
| Resolucao | 1920x1080 | Full HD |
| FPS | 30fps | Balance entre fluidez e tamanho |
| Duracao | 5-10 segundos | Loop continuo |
| Tamanho alvo | < 500KB | Apos compressao |
| Fundo | Transparente | Alpha channel obrigatorio |

### 4.2. Formato de Fallback (Imagem)

| Propriedade | Valor | Notas |
|-------------|-------|-------|
| Formato | WebP | Melhor compressao que PNG |
| Resolucao | 1920x1080 | Mesma do video |
| Fundo | Transparente | Para integracao |
| Tamanho alvo | < 200KB | Para lazy loading rapido |

### 4.3. Sequencia de Frames (para "fake video")

| Propriedade | Valor | Notas |
|-------------|-------|-------|
| Formato | JPG | Para frames individuais |
| Resolucao | 960x540 | Metade da resolucao |
| Numero de frames | 24-30 | Para 5-10 segundos |
| Intervalo | 167-333ms | Alternancia entre frames |
| Fundo | Preto (#000000) | Com CSS blend mode |

---

## 5. GUIA DE GERACAO PASSO A PASSO

### Fase 1: Gerar Frames Estaticos

**Passo 1:** Preparar Midjourney/DALL-E (conta Standard ou superior)
**Passo 2:** Gerar Frame Inicial - copiar Prompt 1, gerar 4 variantes, selecionar a melhor, iterar, exportar PNG com fundo transparente
**Passo 3:** Gerar Frame Final - copiar Prompt 2, gerar 4 variantes, selecionar a melhor (que combine com Frame Inicial), iterar, exportar PNG
**Passo 4:** Validar coerencia visual - comparar lado a lado, verificar cores dos arquetipos, ajustar prompts se necessario

### Fase 2: Gerar Video Animado

**Passo 1:** Preparar Runway/Pika/Luma (conta Standard/Pro)
**Passo 2:** Upload dos frames - Frame Inicial como "Start Frame", Frame Final como "End Frame", duracao 5-10s
**Passo 3:** Configurar animacao - Motion: Low, Guidance: 7-8, Camera: Slow orbit
**Passo 4:** Gerar e iterar - gerar ate 5 versoes, selecionar a melhor
**Passo 5:** Pos-producao (opcional) - ajustar timing, fade in/out, exportar WebM com alpha

### Fase 3: Otimizar para Web

**Passo 1:** Comprimir video com FFmpeg: `ffmpeg -i input.mp4 -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 200K -an output.webm`
**Passo 2:** Criar fallback image - extrair melhor frame, converter para WebP, comprimir < 200KB
**Passo 3:** Criar sequencia de frames - extrair a cada 167ms (6fps), redimensionar 960x540, JPG quality 80

---

## 6. COMPONENTE REACT - CyberpunkBrain.tsx

### 6.1. Estrutura

`	sx
// src/components/identity/CyberpunkBrain.tsx
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type CyberpunkBrainVariant = 'initial' | 'final' | 'looping';
type CyberpunkBrainSize = 'sm' | 'md' | 'lg' | 'xl';

interface CyberpunkBrainProps {
  arch?: 'AO' | 'SS' | 'EA' | 'HI';
  variant?: CyberpunkBrainVariant;
  size?: CyberpunkBrainSize;
  useVideo?: boolean;
  className?: string;
  onLoaded?: () => void;
}
`

### 6.2. CSS Filters por Arquetipo

`	sx
const ARCHETYPE_FILTERS: Record<string, string> = {
  AO: 'hue-rotate(180deg) saturate(1.2) brightness(0.9)',
  SS: 'hue-rotate(270deg) saturate(1.3) brightness(1.1)',
  EA: 'saturate(0.6) brightness(0.85) contrast(1.1)',
  HI: 'hue-rotate(-30deg) saturate(1.4) brightness(1.05)',
};
`

### 6.3. Tamanhos

`	sx
const SIZE_MAP: Record<CyberpunkBrainSize, string> = {
  sm: 'w-48 h-27',
  md: 'w-64 h-36',
  lg: 'w-96 h-54',
  xl: 'w-[640px] h-[360px]',
};
`

### 6.4. Lazy Loading com IntersectionObserver

Preload 200px antes de entrar no viewport. Detectar suporte a WebM com alpha. Fallback: sequencia de frames -> imagem estatica -> SVG atual.

---

## 7. INTEGRACAO NA PAGINA REVEAL

### Localizacao: `src/routes/index.tsx` linhas 789-931

**Mudancas:**

1. Importar CyberpunkBrain: `import { CyberpunkBrain } from '@/components/identity/CyberpunkBrain';`
2. Substituir `<ArchetypeRevealHero arch={arch} />` por `<CyberpunkBrain arch={arch} variant="looping" size="xl" useVideo={true} className="mx-auto" />`
3. Manter: typewriter effect, hook cards, CTA button, error banner

### Compatibilidade com ArchetypeRevealStage

O ArchetypeRevealStage ja fornece fog atmosphere, particulas por arquetipo e simbolo gigante. O CyberpunkBrain se integra como peca central com fundo transparente.

---

## 8. FALLBACKS E PERFORMANCE

### Estrategia de Fallback

`
1. Detectar suporte WebM com alpha
2. Se suporta -> carregar brain.webm
3. Se falhar -> sequencia de frames (frame-001.jpg a frame-030.jpg)
4. Se falhar -> imagem estatica (fallback.webp)
5. Se falhar -> ArchetypeRevealHero (SVG atual)
`

### Performance Budget

| Recurso | Tamanho Alvo | Tamanho Maximo |
|---------|--------------|----------------|
| brain.webm | 300KB | 500KB |
| brain-mobile.webm | 150KB | 250KB |
| fallback.webp | 100KB | 200KB |
| frame sequence (30 frames) | 450KB | 750KB |
| **Total** | **~1MB** | **~1.7MB** |

### Otimizacao Mobile

Em mobile, usar sequencia de frames em vez de video. Versao mobile: 640x360. IntersectonObserver com rootMargin 200px para preload.

---

## 9. DECOMPOSICAO PARA "FAKE VIDEO"

### Extracao de Frames

`ash
# 6fps para 5s = 30 frames
ffmpeg -i brain.webm -vf "fps=6,scale=960:540" -q:v 2 frame-%03d.jpg

# 2fps para 5s = 10 keyframes
ffmpeg -i brain.webm -vf "fps=2,scale=960:540" -q:v 2 keyframe-%03d.jpg
`

### CSS Transitions entre Frames

`css
.brain-frame {
  transition: opacity 0.15s ease-out;
  will-change: opacity;
}
`

---

## 10. PROXIMOS PASSOS

### Timeline Estimada

| Fase | Duracao | Dependencias |
|------|---------|--------------|
| 1. Gerar frames estaticos | 2-4h | Conta Midjourney/DALLE |
| 2. Gerar video animado | 2-6h | Conta Runway/Pika/Luma |
| 3. Otimizar para web | 1-2h | FFmpeg |
| 4. Criar componente React | 2-4h | Frames + video prontos |
| 5. Integrar na pagina Reveal | 1-2h | Componente pronto |
| 6. Testes e ajustes | 2-4h | Integracao completa |
| **Total** | **10-22h** | |

### Dependencias

- [ ] Conta Midjourney (Standard) OU DALL-E 3 (ChatGPT Plus)
- [ ] Conta Runway (Standard) OU Pika Labs (Pro) OU Luma Dream Machine
- [ ] FFmpeg instalado
- [ ] Acesso ao repositorio thoughtsculpt-engine

### Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Video com alpha nao funciona em todos browsers | Media | Alto | Fallback para sequencia de frames |
| Tamanho do video excede budget | Alta | Medio | Compressao agressiva + mobile |
| Frames nao combinam visualmente | Media | Alto | Iterar prompts |
| Performance ruim em mobile | Media | Medio | Lazy loading + versao mobile |
| Cores nao ficam vibrantes apos filtro | Baixa | Medio | Ajustar CSS filters individualmente |

### Criterios de Aceite

- [ ] Video carrega em < 2s em 3G
- [ ] Tamanho total < 1.5MB
- [ ] Funciona em Chrome, Firefox, Safari, Edge
- [ ] Fallback funciona quando video nao carrega
- [ ] CSS filters mantem vibrancia das cores
- [ ] Animacao integra com ArchetypeRevealStage
- [ ] Nao quebra performance low-tier
- [ ] Fundo transparente funciona
- [ ] Loop continuo sem "pulo" perceptivel

---

## 11. REFERENCIAS VISUAIS

1. **Blade Runner 2049** - Neon + nevoa + arquitetura massiva
2. **Ghost in the Shell (2017)** - Cyberpunk organico + circuitos visiveis
3. **Westworld** - Neural pathways + transformacao + Premium
4. **Stranger Things** - O "Upside Down" como mentalidade limitante
5. **Arcane (Netflix)** - Arte cyberpunk + psicologia + cores vibrantes

---

## 12. NOTAS FINAIS

### O que NAO fazer:
- Texto, palavras, letras nas artes
- Logos ou marcas dagua
- Bordas ou enquadramento visivel
- Cores que nao correspondam aos arquetipos
- Fundo branco ou colorido (deve ser transparente/preto)
- Animacao generica ou "stock footage"

### O que FAZER:
- Cerebro cyberpunk ultra-detalhado
- 4 cores de arquetipos (azul, roxo, cinza, laranja)
- Elementos gregos (marmore, colunas)
- Simbolos de codigo/programacao
- Fundo transparente
- Animacao suave e premium
- Loop continuo
- Representacao de "reset mental"

---

*Documento gerado em 2026-06-16 para o projeto MindReset SaaS.*
*Referencia: Reveal2.txt + analise completa do codebase.*
