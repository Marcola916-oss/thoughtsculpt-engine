const fs = require('fs');

const file = 'src/components/funnel/CheckoutStub.tsx';
let code = fs.readFileSync(file, 'utf8');

// Modificando os textos do COPY
// Em português:
code = code.replace(
  'mainItem: "Diagnóstico Comportamental — PDF",',
  'mainItem: "Dossiê: O Seu Perfil Psicológico — Arquétipo Identificado",'
).replace(
  'mainDesc: "30+ páginas · 4 áreas · personalizado",',
  'mainDesc: "30+ pág. · Análise Financeira, Profissional, Amorosa e Pessoal",'
);

// Em inglês:
code = code.replace(
  'mainItem: "Behavioral Diagnosis — PDF",',
  'mainItem: "Dossier: Your Psychological Profile — Archetype Identified",'
).replace(
  'mainDesc: "30+ pages · 4 areas · personalized",',
  'mainDesc: "30+ pages · Financial, Professional, Romantic & Personal Analysis",'
);

// Adicionar um Badge "Escolha da Maioria" no bump2Title
// Wait, doing this via replace is brittle. Let's just write the whole new UI into a string and replace the `return (` block!

const newReturn = `
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-20 pb-32 md:pb-20">
      <Reveal variant="fade-up" className="mx-auto mb-10 max-w-2xl text-center">
        <span aria-hidden className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-arch-primary">
          <Lock className="h-3 w-3" />
          {copy.secureBy}
        </span>
        <h1 className="font-display text-3xl font-black uppercase italic leading-tight tracking-tight md:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-base text-white/70 md:text-lg">{copy.sub}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        {/* ──────── Order + CTA ──────── */}
        <Reveal variant="fade-up">
          <div className="rounded-3xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)]">
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/10 pb-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                {copy.summary}
              </h2>
              <CountdownPill minutes={15} label={copy.countdownLabel} />
            </div>

            {/* Impacto 4D - Mini Dashboard */}
            <div className="mb-6 rounded-2xl bg-arch-primary/[0.03] border border-arch-primary/10 p-5">
               <p className="text-xs uppercase tracking-widest text-arch-primary font-bold mb-3">O Que Você Vai Receber Hoje:</p>
               <ul className="space-y-2 text-sm text-white/80">
                 <li className="flex gap-2"><Check className="w-4 h-4 text-arch-primary shrink-0"/> Dossiê Completo do seu Arquétipo (+30 Páginas)</li>
                 <li className="flex gap-2"><Check className="w-4 h-4 text-arch-primary shrink-0"/> Análise de Padrões Financeiros Ocultos</li>
                 <li className="flex gap-2"><Check className="w-4 h-4 text-arch-primary shrink-0"/> Desbloqueio de Crenças Profissionais</li>
                 <li className="flex gap-2"><Check className="w-4 h-4 text-arch-primary shrink-0"/> Mapeamento de Atritos Amorosos e Pessoais</li>
               </ul>
            </div>

            {/* Main item */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-black uppercase italic tracking-tight">{copy.mainItem}</p>
                <p className="mt-1 text-sm text-white/60">{copy.mainDesc}</p>
              </div>
              <div className="shrink-0 text-end">
                {anchorFormatted && (
                  <p className="text-xs text-white/40 line-through">
                    {copy.anchorLabel} {anchorFormatted}
                  </p>
                )}
                <p className="font-mono text-xl font-bold text-arch-primary">{prices?.main.formatted ?? "—"}</p>
              </div>
            </div>

            {/* Bumps */}
            <BumpRow
              active={bump1}
              onToggle={toggleBump1}
              title={copy.bump1Title}
              desc={copy.bump1Desc}
              price={prices?.bump1.formatted ?? "—"}
              addLabel={copy.addLabel}
              addedLabel={copy.addedLabel}
            />
            
            <div className="relative mt-4">
              <div className="absolute -top-3 left-6 z-10 rounded-full bg-arch-primary px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg">
                Escolha da Maioria
              </div>
              <BumpRow
                active={bump2}
                onToggle={toggleBump2}
                title={copy.bump2Title}
                desc={copy.bump2Desc}
                price={prices?.bump2.formatted ?? "—"}
                addLabel={copy.addLabel}
                addedLabel={copy.addedLabel}
                isHighlighted
              />
            </div>

            {/* Total */}
            <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-5">
              <div>
                <span className="block text-sm font-bold uppercase tracking-[0.15em] text-white/80">{copy.total}</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-white/45">{copy.oneTimeNote}</span>
              </div>
              <span className="font-display text-4xl font-black italic text-arch-primary md:text-5xl">
                {totalFormatted}
              </span>
            </div>

            {/* Offer badge */}
            <div
              aria-hidden
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-arch-primary/30 bg-arch-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-arch-primary"
            >
              <Zap className="h-3 w-3" />
              {copy.offerBadge}
            </div>

            {/* CTA — Kinetic Sweep */}
            <ButtonPress>
              <button
                type="button"
                onClick={handleClick}
                disabled={submitting || !leadId}
                className="group relative mt-8 flex w-full overflow-hidden items-center justify-center gap-3 rounded-2xl bg-arch-primary px-6 py-5 text-base md:text-lg font-black uppercase tracking-wide text-primary-foreground shadow-[0_20px_50px_-10px_var(--arch-glow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-5px_var(--arch-glow)] active:scale-[0.98] disabled:opacity-60"
              >
                {/* Kinetic sweep effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <Lock className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{submitting ? copy.processing : copy.payButton(totalFormatted)}</span>
                {!submitting && <ArrowRight className="h-5 w-5 relative z-10 transition-transform group-hover:translate-x-1" />}
              </button>
            </ButtonPress>

            <p className="mt-5 text-center text-xs text-white/55">
              {copy.ctaSubcopy(copy.paymentMethods)}
            </p>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/35">
              {copy.poweredBy}
            </p>
          </div>
        </Reveal>

        {/* ──────── Trust stack ──────── */}
        <Reveal variant="fade-up" delay={0.2}>
          <div className="lg:sticky lg:top-24 space-y-5">
            {/* Garantia Hero */}
            <div className="rounded-3xl border-2 border-arch-primary/30 bg-black/40 p-6 backdrop-blur-xl relative overflow-hidden">
               <div className="absolute -right-6 -top-6 text-arch-primary/10">
                 <ShieldCheck className="w-32 h-32" />
               </div>
               <ShieldCheck className="w-8 h-8 text-arch-primary mb-4" />
               <h3 className="text-lg font-black uppercase italic text-white mb-2">{copy.trustGuarantee}</h3>
               <p className="text-sm text-white/70 leading-relaxed relative z-10">{copy.trustGuaranteeDesc}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                {copy.trustTitle}
              </h3>
              <ul className="space-y-5">
                <TrustItem icon={Lock} title={copy.trustStripe} desc={copy.trustStripeDesc} />
                <TrustItem icon={Check} title={copy.trustSecure} desc={copy.trustSecureDesc} />
                <TrustItem icon={Mail} title={copy.trustDelivery} desc={copy.trustDeliveryDesc} />
              </ul>
            </div>

            {/* Mini-testimonial */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
              <div className="mb-3 flex gap-1 text-arch-primary" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                    <path d="M10 1.5l2.6 5.4 6 .9-4.3 4.2 1 6L10 15.3l-5.3 2.7 1-6L1.4 7.8l6-.9z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-white/85 italic">"{copy.testimonialQuote}"</p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                {copy.testimonialAuthor}
              </p>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                {copy.faqTitle}
              </h3>
              <div className="divide-y divide-white/10">
                {copy.faq.map((f, i) => (
                  <FAQItem key={i} q={f.q} a={f.a} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ──────── Sticky mobile CTA ──────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">{copy.total}</p>
            <p className="font-display text-lg font-black italic text-arch-primary">{totalFormatted}</p>
          </div>
          <button
            type="button"
            onClick={handleClick}
            disabled={submitting || !leadId}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-arch-primary px-4 py-3 text-sm font-black uppercase tracking-wide text-primary-foreground shadow-[0_0_24px_-6px_var(--arch-glow)] transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {submitting ? "…" : copy.payButton(totalFormatted)}
          </button>
        </div>
      </div>
    </section>
  );
`;

const returnIndex = code.indexOf('return (');
const afterReturn = code.substring(0, returnIndex);
const tailIndex = code.lastIndexOf('}');
const tail = code.substring(code.indexOf('function formatCentsLike'), code.length);

let newCode = afterReturn + newReturn + '\\n}\\n\\n' + tail;

// Modify BumpRow to accept isHighlighted prop
newCode = newCode.replace(
  'function BumpRow(props: {',
  \`function BumpRow(props: {
  isHighlighted?: boolean;\`
);

newCode = newCode.replace(
  'const { active, onToggle, title, desc, price, addLabel, addedLabel } = props;',
  'const { active, onToggle, title, desc, price, addLabel, addedLabel, isHighlighted } = props;'
);

newCode = newCode.replace(
  'active\\n          ? "border-arch-primary/60 bg-arch-primary/[0.08]"\\n          : "border-white/10 bg-black/30 hover:border-white/25"',
  \`active
          ? "border-arch-primary/60 bg-arch-primary/[0.08]"
          : isHighlighted 
            ? "border-arch-primary/30 bg-black/40 hover:border-arch-primary/50" 
            : "border-white/10 bg-black/30 hover:border-white/25"\`
);

fs.writeFileSync(file, newCode);
console.log('Checkout stub updated.');
