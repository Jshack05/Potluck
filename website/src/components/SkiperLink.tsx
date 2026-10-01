// Adapted from Skiper UI 40, Link001 (Gurvinder Singh).
// CSS ports the original underline/arrow motion and adds keyboard/reduced-motion support.
// Free-version attribution is visible in the site footer. See THIRD_PARTY_NOTICES.md.
import type { AnchorHTMLAttributes } from "react";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={diagonal ? "arrow diagonal" : "arrow"}
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SkiperLink({
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`skiper-link ${className}`} {...props}>
      <span>{children}</span>
      <svg
        className="skiper-arrow"
        fill="none"
        viewBox="0 0 10 10"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
