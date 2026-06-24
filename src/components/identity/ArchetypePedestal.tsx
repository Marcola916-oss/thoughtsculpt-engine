import React from 'react';

export function ArchetypePedestal({ arch }: { arch?: "AO" | "SS" | "EA" | "HI" }) {
  // O componente usa a cor do arquétipo via variáveis CSS já configuradas (--arch-primary, --arch-glow).
  return (
    <div className="relative w-full aspect-[2/1] flex items-end justify-center pointer-events-none mb-12 -translate-y-6 md:-translate-y-8 opacity-90 transition-opacity duration-1000">
      
      {/* Base 3D Holográfica (Cilindro e anéis no chão) */}
      <div 
        className="absolute bottom-[5%] w-[85%] md:w-[75%] h-full"
        style={{ perspective: "1200px" }}
      >
        <div 
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(72deg)" }}
        >
          {/* Anel de brilho externo no chão */}
          <div className="absolute inset-[-15%] rounded-full border border-arch-primary/10 shadow-[0_0_60px_var(--arch-glow)] opacity-70" />
          
          {/* Piso principal da base */}
          <div className="absolute inset-0 rounded-full border-[2px] border-arch-primary/40 bg-arch-primary/5 shadow-[inset_0_0_80px_var(--arch-glow)] backdrop-blur-sm">
            {/* Anéis internos de dados */}
            <div className="absolute inset-[10%] rounded-full border border-arch-primary/50 shadow-[0_0_30px_var(--arch-glow)]" />
            <div className="absolute inset-[25%] rounded-full border border-arch-primary/30" />
            
            {/* Anéis giratórios com traços */}
            <div className="absolute inset-[5%] border-2 border-dashed border-arch-primary/40 rounded-full animate-[spin_30s_linear_infinite]" />
            <div className="absolute inset-[18%] border-[3px] border-dotted border-arch-primary/60 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
          </div>

          {/* Símbolos Gregos girando no chão */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translate3d(0, 30%, -34px)" }}
          >
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_45s_linear_infinite]">
              {['Φ', 'Σ', 'Ψ', 'Ω', 'Δ', 'Λ', 'Π', 'Θ'].map((sym, i) => (
                <div 
                  key={i} 
                  className="absolute text-arch-primary/70 font-mono text-xl md:text-3xl font-black drop-shadow-[0_0_15px_var(--arch-glow)]"
                  style={{ 
                    transform: `rotate(${i * 45}deg) translateY(-150%) rotate(-${i * 45}deg)`,
                  }}
                >
                  {sym}
                </div>
              ))}
            </div>
          </div>

          {/* Borda superior do Cilindro de Vidro (Criando a parede) */}
          <div 
            className="absolute inset-[-5%] rounded-full border-[3px] border-arch-primary/60 shadow-[0_0_40px_var(--arch-glow)] bg-arch-primary/5" 
            style={{ transform: "translateZ(100px)" }} 
          >
            {/* Código binário e dados flutuando na parede do vidro */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: "translate3d(0, 28%, -30px)" }}
            >
              <div className="absolute inset-0 flex items-center justify-center animate-[spin_60s_linear_infinite_reverse]">
                {['10110', '01001', '11010', '00110', '10101', '01110', '11001', '10011'].map((bin, i) => (
                  <div 
                    key={i} 
                    className="absolute text-cyan-400/60 font-mono text-[10px] md:text-xs font-bold tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    style={{ 
                      transform: `rotate(${i * 45}deg) translateY(-175%) rotate(-${i * 45}deg)`,
                    }}
                  >
                    {bin}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Anel holográfico intermediário (flutuando no meio do cilindro) */}
          <div 
            className="absolute inset-[2%] rounded-full border-2 border-arch-primary/30 shadow-[0_0_20px_var(--arch-glow)]" 
            style={{ transform: "translateZ(50px)" }} 
          />
        </div>
      </div>

      {/* Overlay 2D para a parede de vidro do cilindro (Simula a refração frontal) */}
      <div className="absolute bottom-[0%] w-[94%] md:w-[83%] h-[55%] rounded-[50%] border-t-[3px] border-l border-r border-arch-primary/40 bg-gradient-to-b from-arch-primary/20 via-arch-primary/5 to-transparent backdrop-blur-[2px] pointer-events-none shadow-[0_-20px_50px_var(--arch-glow)]" />

      {/* Feixes de luz holográficos projetando o cérebro a partir do anel rotatório interno */}
      <div
        aria-hidden
        className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[34%] md:w-[28%] h-[78%] pointer-events-none mix-blend-screen"
      >
        {[
          // Beams originam do anel interno e convergem suavemente em direção ao cérebro
          { left: "8%",  rot: "-10deg", delay: "0s",   dur: "4.2s", op: 0.14 },
          { left: "30%", rot: "-4deg",  delay: "0.7s", dur: "4.6s", op: 0.18 },
          { left: "50%", rot: "0deg",   delay: "0.3s", dur: "4.0s", op: 0.20 },
          { left: "70%", rot: "4deg",   delay: "1.0s", dur: "4.6s", op: 0.18 },
          { left: "92%", rot: "10deg",  delay: "0.5s", dur: "4.2s", op: 0.14 },
        ].map((b, i) => (
          <div
            key={i}
            className="absolute bottom-0 h-full origin-bottom"
            style={{
              left: b.left,
              transform: `translateX(-50%) rotate(${b.rot})`,
            }}
          >
            <div
              className="w-[4px] md:w-[5px] h-full rounded-full blur-[4px]"
              style={{
                background:
                  "linear-gradient(to top, var(--arch-primary) 0%, var(--arch-glow) 35%, transparent 100%)",
                opacity: b.op,
                animation: `arch-beam-pulse ${b.dur} ease-in-out ${b.delay} infinite`,
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes arch-beam-pulse {
          0%, 100% { opacity: 0.10; transform: scaleY(0.96); }
          50%      { opacity: 0.28; transform: scaleY(1.02); }
        }
      `}</style>

    </div>
  );
}