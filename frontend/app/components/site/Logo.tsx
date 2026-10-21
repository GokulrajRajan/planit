import Link from "next/link";

/** The client's logo from site settings, or the placeholder wordmark until one is uploaded. */
export function Logo({ logoUrl, className }: { logoUrl: string | null; className?: string }) {
  return (
    <Link href="/" className={`wordmark ${className ?? ""}`} aria-label="Planit home">
      {logoUrl ? (
        // The logo can live on any host the admin chooses, which next/image would need configured in advance.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Planit – Start Early" />
      ) : (
        "Planit"
      )}
    </Link>
  );
}
