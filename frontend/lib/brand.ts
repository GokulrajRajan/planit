import type { SiteSettings } from "./site-data";

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const channel = (offset: number) => {
    const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG contrast ratio between two #rrggbb colours, from 1 (none) to 21. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Dark text on light colours and white text on dark ones. */
function readableTextOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#1c1a19" : "#ffffff";
}

/**
 * Overrides the placeholder brand tokens in globals.css with the colours saved in site settings.
 * The API only accepts #rrggbb values, so they are safe to drop into a style attribute.
 */
export function brandStyle({ primary_color, accent_color }: SiteSettings["branding"]): React.CSSProperties {
  const style: Record<string, string> = {};
  if (primary_color) {
    style["--brand-primary"] = primary_color;
    style["--brand-on-primary"] = readableTextOn(primary_color);
  }
  if (accent_color) {
    style["--brand-accent"] = accent_color;
    style["--brand-on-accent"] = readableTextOn(accent_color);
  }
  return style as React.CSSProperties;
}
