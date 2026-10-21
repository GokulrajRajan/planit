import { existsSync } from "node:fs";
import path from "node:path";

// Server-only (reads the filesystem). The client's logo file, served from /public.
const BUNDLED_LOGO = "/brand/planit-logo.png";
const bundledLogoExists = existsSync(path.join(process.cwd(), "public", BUNDLED_LOGO));

/**
 * The logo to show: one uploaded through Site settings wins, then the bundled file; null means
 * neither exists yet and the text wordmark is shown instead.
 */
export function resolveLogoUrl(settingsLogoUrl: string | null = null): string | null {
  return settingsLogoUrl ?? (bundledLogoExists ? BUNDLED_LOGO : null);
}
