import { DSSection } from "../ds-section"

const colorGroups = [
  {
    group: "Brand",
    tokens: [
      { var: "--primary", label: "Primary (Gold)", value: "oklch(0.75 0.15 85)" },
      { var: "--brand-gold-soft", label: "Gold Soft", value: "oklch(0.83 0.11 84)" },
      { var: "--secondary", label: "Secondary (Navy)", value: "oklch(0.23 0.02 250)" },
      { var: "--brand-navy", label: "Brand Navy", value: "oklch(0.18 0.02 250)" },
      { var: "--brand-navy-deep", label: "Navy Deep", value: "oklch(0.13 0.02 250)" },
    ],
  },
  {
    group: "Surface",
    tokens: [
      { var: "--background", label: "Background", value: "oklch(0.13 0.02 250)" },
      { var: "--card", label: "Card", value: "oklch(0.18 0.02 250)" },
      { var: "--muted", label: "Muted", value: "oklch(0.30 0.02 250)" },
      { var: "--border", label: "Border", value: "oklch(0.30 0.02 250)" },
      { var: "--input", label: "Input", value: "oklch(0.30 0.02 250)" },
    ],
  },
  {
    group: "Text",
    tokens: [
      { var: "--foreground", label: "Foreground", value: "oklch(0.97 0.01 250)" },
      { var: "--card-foreground", label: "Card FG", value: "oklch(0.97 0.01 250)" },
      { var: "--muted-foreground", label: "Muted FG", value: "oklch(0.65 0.02 250)" },
      { var: "--primary-foreground", label: "Primary FG", value: "oklch(0.13 0.02 250)" },
    ],
  },
  {
    group: "Status",
    tokens: [
      { var: "--success", label: "Success", value: "#10b981" },
      { var: "--info", label: "Info", value: "#0ea5e9" },
      { var: "--warning", label: "Warning", value: "#f59e0b" },
      { var: "--destructive", label: "Destructive", value: "oklch(0.577 0.245 27.325)" },
    ],
  },
  {
    group: "Chart",
    tokens: [
      { var: "--chart-1", label: "Chart 1", value: "oklch(0.646 0.222 41.116)" },
      { var: "--chart-2", label: "Chart 2", value: "oklch(0.6 0.118 184.704)" },
      { var: "--chart-3", label: "Chart 3", value: "oklch(0.398 0.07 227.392)" },
      { var: "--chart-4", label: "Chart 4", value: "oklch(0.828 0.189 84.429)" },
      { var: "--chart-5", label: "Chart 5", value: "oklch(0.769 0.188 70.08)" },
    ],
  },
  {
    group: "Sidebar",
    tokens: [
      { var: "--sidebar", label: "Sidebar BG", value: "oklch(0.13 0.02 250)" },
      { var: "--sidebar-primary", label: "Sidebar Primary", value: "oklch(0.75 0.15 85)" },
      { var: "--sidebar-accent", label: "Sidebar Accent", value: "oklch(0.18 0.02 250)" },
      { var: "--sidebar-border", label: "Sidebar Border", value: "oklch(0.30 0.02 250)" },
    ],
  },
]

const typescale = [
  { cls: "text-4xl font-bold tracking-tight", label: "text-4xl / bold", sample: "Display Heading" },
  { cls: "text-3xl font-bold tracking-tight", label: "text-3xl / bold", sample: "Page Title" },
  { cls: "text-2xl font-semibold", label: "text-2xl / semibold", sample: "Section Title" },
  { cls: "text-xl font-semibold", label: "text-xl / semibold", sample: "Card Title" },
  { cls: "text-lg font-medium", label: "text-lg / medium", sample: "Subsection Header" },
  { cls: "text-base", label: "text-base / regular", sample: "Body text — primary reading content for descriptions and paragraphs" },
  { cls: "text-sm", label: "text-sm / regular", sample: "Small body — labels, secondary content, metadata" },
  { cls: "text-xs", label: "text-xs / regular", sample: "Caption, helper text, timestamps" },
  { cls: "text-[11px] font-medium uppercase tracking-widest", label: "text-[11px] / uppercase", sample: "SECTION LABEL / EYEBROW" },
]

const fonts = [
  { name: "Inter (sans)", cls: "font-sans", sample: "The quick brown fox jumps over the lazy dog" },
  { name: "Geist Mono (mono)", cls: "font-mono", sample: "const price = $2,800.00; // tabular data" },
  { name: "Source Serif 4 (display / reserved)", cls: "font-display", sample: "Serif reserved for editorial contexts" },
]

const spacingTokens = [
  { var: "--spacing-inset", rem: "0.75rem", px: "12px", label: "Inset — internal padding (tight)" },
  { var: "--spacing-stack", rem: "1rem", px: "16px", label: "Stack — vertical rhythm between elements" },
  { var: "--spacing-gutter", rem: "1.5rem", px: "24px", label: "Gutter — primary horizontal/section spacing" },
  { var: "--spacing-section", rem: "2rem", px: "32px", label: "Section — gap between page sections" },
  { var: "--spacing-rail", rem: "13.75rem", px: "220px", label: "Rail — expanded sidebar width" },
  { var: "--spacing-rail-collapsed", rem: "4.5rem", px: "72px", label: "Rail Collapsed — icon-only sidebar" },
]

const radii = [
  { label: "radius-sm", var: "--radius-sm", value: "0.375rem / 6px", tailwind: "rounded-[var(--radius-sm)]" },
  { label: "radius-md", var: "--radius-md", value: "0.5rem / 8px", tailwind: "rounded-[var(--radius-md)]" },
  { label: "radius-lg", var: "--radius-lg", value: "0.625rem / 10px", tailwind: "rounded-[var(--radius-lg)]" },
  { label: "radius-xl", var: "--radius-xl", value: "0.875rem / 14px", tailwind: "rounded-[var(--radius-xl)]" },
  { label: "radius-2xl", var: "--radius-2xl", value: "1rem / 16px", tailwind: "rounded-[var(--radius-2xl)]" },
  { label: "radius-card", var: "--radius-card", value: "0.875rem / 14px (cards)", tailwind: "rounded-[var(--radius-card)]" },
  { label: "radius-panel", var: "--radius-panel", value: "0.625rem / 10px (panels)", tailwind: "rounded-[var(--radius-panel)]" },
]

export function TokensSection() {
  return (
    <div className="space-y-12" id="tokens-root">
      {/* Colors */}
      <DSSection id="colors" title="Colors" source="Foundation">
        <div className="space-y-8">
          {colorGroups.map((group) => (
            <div key={group.group}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {group.group}
              </p>
              <div className="flex flex-wrap gap-3">
                {group.tokens.map((token) => (
                  <div key={token.var} className="flex flex-col gap-1.5">
                    <div
                      className="h-14 w-24 rounded-lg border border-border/60 shadow-sm"
                      style={{ backgroundColor: `var(${token.var})` }}
                    />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-medium text-foreground">{token.label}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{token.var}</p>
                      <p className="font-mono text-[9px] text-muted-foreground/70">{token.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DSSection>

      {/* Typography */}
      <DSSection id="typography" title="Typography" source="Foundation">
        <div className="space-y-8">
          {/* Fonts */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Font Families
            </p>
            <div className="space-y-4">
              {fonts.map((font) => (
                <div key={font.name} className="flex items-baseline gap-6 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <span className="w-52 shrink-0 text-[11px] text-muted-foreground">{font.name}</span>
                  <span className={`text-lg text-foreground ${font.cls}`}>{font.sample}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Type Scale */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Type Scale
            </p>
            <div className="space-y-4">
              {typescale.map((item) => (
                <div key={item.label} className="flex items-baseline gap-6 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <span className="w-52 shrink-0 font-mono text-[10px] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className={`min-w-0 text-foreground ${item.cls}`}>{item.sample}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DSSection>

      {/* Spacing */}
      <DSSection id="spacing" title="Spacing" source="Foundation">
        <div className="space-y-3">
          {spacingTokens.map((token) => (
            <div key={token.var} className="flex items-center gap-4">
              <div className="flex w-52 shrink-0 flex-col">
                <span className="font-mono text-[11px] text-foreground">{token.var}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {token.rem} / {token.px}
                </span>
              </div>
              <div
                className="h-6 rounded bg-primary/20 border border-primary/30"
                style={{ width: token.rem }}
              />
              <span className="text-xs text-muted-foreground">{token.label}</span>
            </div>
          ))}
        </div>
      </DSSection>

      {/* Radii & Shadows */}
      <DSSection id="radii-shadows" title="Radii & Shadows" source="Foundation">
        <div className="space-y-8">
          {/* Radii */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Border Radius
            </p>
            <div className="flex flex-wrap gap-6">
              {radii.map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-16 w-16 border-2 border-primary/50 bg-primary/10 ${r.tailwind}`}
                  />
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-foreground">{r.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shadows */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Shadows
            </p>
            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-24 w-36 items-center justify-center rounded-xl border border-border/40 bg-card text-xs text-muted-foreground"
                  style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.22)" }}
                >
                  --shadow-card
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  0 10px 30px rgba(0,0,0,0.22)
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-24 w-36 items-center justify-center rounded-xl border border-border/40 bg-card text-xs text-muted-foreground"
                  style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}
                >
                  --shadow-overlay
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  0 20px 50px rgba(0,0,0,0.35)
                </p>
              </div>
            </div>
          </div>
        </div>
      </DSSection>
    </div>
  )
}
