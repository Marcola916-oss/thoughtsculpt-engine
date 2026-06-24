/**
 * "Scar" bullet — a vertical 2px line in arch-primary + text.
 * No icon. Used in Pain Mirror (B2).
 */
export function PainScar({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative ps-5 py-2 text-foreground/85 leading-relaxed">
      <span
        aria-hidden
        className="absolute inset-y-2 start-0 w-[2px] rounded-full"
        style={{
          background: "linear-gradient(180deg, transparent 0%, var(--arch-primary) 50%, transparent 100%)",
          boxShadow: "0 0 12px color-mix(in oklab, var(--arch-primary) 60%, transparent)",
        }}
      />
      {children}
    </li>
  );
}

export default PainScar;