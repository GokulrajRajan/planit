import Link from "next/link";

/** A site path ("/contact") uses client-side navigation; a full URL opens in a new tab. */
export function SmartLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {children}
    </a>
  );
}
