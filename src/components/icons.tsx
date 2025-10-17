import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <path d="M12 10V2" />
      <path d="m14.5 4.5-5 5" />
      <path d="m9.5 4.5 5 5" />
    </svg>
  );
}

export function Facebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Twitter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4 1.4-2.1 2.1c-.1.1-.3.3-.4.4.1.1.2.2.3.3 1.5 1.5 3.3 4.4 3.3 4.4s-1.4 1.4-2.1 2.1c-.1.1-.3.3-.4.4.1.1.2.2.3.3 1.5 1.5 3.3 4.4 3.3 4.4s-1.4 1.4-2.1 2.1c-.1.1-.3.3-.4.4.1.1.2.2.3.3" />
      <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4 1.4-2.1 2.1c-.1.1-.3.3-.4.4.1.1.2.2.3.3 1.5 1.5 3.3 4.4 3.3 4.4s-1.4 1.4-2.1 2.1c-.1.1-.3.3-.4.4.1.1.2.2.3.3 1.5 1.5 3.3 4.4 3.3 4.4s-1.4 1.4-2.1 2.1c-.1.1-.3.3-.4.4.1.1.2.2.3.3" />
      <path d="M2 22s5.2-6.5 10.6-10.6c.1-.1.3-.3.4-.4-.1-.1-.2-.2-.3-.3C10.6 9.1 5.2 2.6 5.2 2.6" />
      <path d="m2 2 10.6 10.6c.1.1.3.3.4.4-.1.1-.2.2-.3.3C10.6 14.9 5.2 21.4 5.2 21.4" />
    </svg>
  );
}

export function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}