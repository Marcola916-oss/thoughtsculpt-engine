import React from 'react';

export function ArchetypePedestal({ arch, part = "all" }: { arch?: "AO" | "SS" | "EA" | "HI", part?: "base" | "front" | "all" }) {
  // O componente usa a cor do arquétipo via variáveis CSS já configuradas (--arch-primary, --arch-glow).
  return (
    <div className="relative w-full aspect-[2/1] flex items-end justify-center pointer-events-none mb-12 opacity-90 transition-opacity duration-1000">
      
      {(part === "all" || part === "base") && (
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
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_45s_linear_infinite]">
              {['Φ', 'Σ', 'Ψ', 'Ω', 'Δ', 'Λ', 'Π', 'Θ'].map((sym, i) => (
                <div 
                  key={i} 
                  className="absolute text-arch-primary/70 font-mono text-xl md:text-3xl font-black drop-shadow-[0_0_15px_var(--arch-glow)]"
                  style={{ 
                    transform: `rotate(${i * 45}deg) translateY(-240%) rotate(-${i * 45}deg)`,
                  }}
                >
                  {sym}
                </div>
              ))}
            </div>

            {/* Borda superior do Cilindro de Vidro (Criando a parede) */}
            <div 
              className="absolute inset-[-5%] rounded-full border-[3px] border-arch-primary/60 shadow-[0_0_40px_var(--arch-glow)] bg-arch-primary/5" 
              style={{ transform: "translateZ(100px)" }} 
            >
              {/* Código binário e dados flutuando na parede do vidro */}
              <div className="absolute inset-0 flex items-center justify-center animate-[spin_60s_linear_infinite_reverse]">
                {['10110', '01001', '11010', '00110', '10101', '01110', '11001', '10011'].map((bin, i) => (
                  <div 
                    key={i} 
                    className="absolute text-cyan-400/60 font-mono text-[10px] md:text-xs font-bold tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    style={{ 
                      transform: `rotate(${i * 45}deg) translateY(-265%) rotate(-${i * 45}deg)`,
                    }}
                  >
                    {bin}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Anel holográfico intermediário (flutuando no meio do cilindro) */}
            <div 
              className="absolute inset-[2%] rounded-full border-2 border-arch-primary/30 shadow-[0_0_20px_var(--arch-glow)]" 
              style={{ transform: "translateZ(50px)" }} 
            />
          </div>
        </div>
      )}

      {(part === "all" || part === "front") && (
        <>
          {/* Overlay 2D para a parede de vidro do cilindro (Simula a refração frontal) */}
          <div className="absolute bottom-[0%] w-[94%] md:w-[83%] h-[55%] rounded-[50%] border-t-[3px] border-l border-r border-arch-primary/40 bg-gradient-to-b from-arch-primary/20 via-arch-primary/5 to-transparent backdrop-blur-[2px] pointer-events-none shadow-[0_-20px_50px_var(--arch-glow)]" />

          {/* Hastes (Stalks) Mecânicas/Holográficas conectando ao Cérebro */}
          <div className="absolute bottom-[35%] w-[15%] h-[40%] flex justify-center items-end gap-3 md:gap-5 pointer-events-none z-0">
            <div className="w-1.5 md:w-2 h-[85%] bg-gradient-to-t from-arch-primary to-transparent shadow-[0_0_15px_var(--arch-glow)] rounded-t-full relative">
                <div className="absolute top-0 w-3 h-3 -left-[3px] md:-left-[2px] bg-white rounded-full shadow-[0_0_15px_var(--arch-glow)]" />
            </div>
            <div className="w-2 md:w-3 h-full bg-gradient-to-t from-arch-primary to-transparent shadow-[0_0_20px_var(--arch-glow)] rounded-t-full relative">
                <div className="absolute top-0 w-4 h-4 -left-[4px] bg-white rounded-full shadow-[0_0_20px_var(--arch-glow)]" />
            </div>
            <div className="w-1.5 md:w-2 h-[90%] bg-gradient-to-t from-arch-primary to-transparent shadow-[0_0_15px_var(--arch-glow)] rounded-t-full relative">
                <div className="absolute top-0 w-3 h-3 -left-[3px] md:-left-[2px] bg-white rounded-full shadow-[0_0_15px_var(--arch-glow)]" />
            </div>
          </div>
        </>
      )}

    </div>
  );
}