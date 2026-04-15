import { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props} />;
}

export function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M5 18.5 6 21l1-2.5L9.5 17 7 16l-1-2.5L5 16l-2.5 1L5 18.5Z" />
    </Icon>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m5 13 4 4L19 7" />
    </Icon>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M3 10h18" />
    </Icon>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3s5 2 8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6c3-1 8-3 8-3Z" />
    </Icon>
  );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m3 3 18 18" />
      <path d="M10.6 5.1A11.8 11.8 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-4.2 4.8" />
      <path d="M6.2 6.2A17.5 17.5 0 0 0 2 12s3.5 7 10 7c1 0 1.9-.2 2.8-.4" />
      <path d="M9.9 9.9A3 3 0 0 0 14.1 14" />
    </Icon>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.9 4.9 1.4 1.4" />
      <path d="m17.7 17.7 1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.3 17.7-1.4 1.4" />
      <path d="m19.1 4.9-1.4 1.4" />
    </Icon>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </Icon>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  );
}

export function TaskNotesLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <defs>
        <linearGradient id="tasknotes-logo-bg" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F172A" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
        <linearGradient id="tasknotes-logo-card" x1="16" y1="12" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F2F4" />
          <stop offset="1" stopColor="#DDEBFA" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="56" height="56" rx="20" fill="url(#tasknotes-logo-bg)" />
      <path
        d="M19.5 19.25C19.5 15.52 22.52 12.5 26.25 12.5H39.08C44.14 12.5 48.25 16.61 48.25 21.67V36.36C48.25 41.05 44.45 44.85 39.76 44.85H27.1C22.89 44.85 19.5 41.45 19.5 37.25V19.25Z"
        fill="#0F172A"
        fillOpacity="0.18"
      />
      <path
        d="M16 18.5C16 14.36 19.36 11 23.5 11H39.1C43.46 11 47 14.54 47 18.9V36.92C47 41.38 43.38 45 38.92 45H23.88C19.53 45 16 41.47 16 37.12V18.5Z"
        fill="url(#tasknotes-logo-card)"
      />
      <path
        d="M16 18.5C16 14.36 19.36 11 23.5 11H39.1C43.46 11 47 14.54 47 18.9V36.92C47 41.38 43.38 45 38.92 45H23.88C19.53 45 16 41.47 16 37.12V18.5Z"
        stroke="#F1F2F4"
        strokeOpacity="0.65"
        strokeWidth="1.5"
      />
      <path d="M23 10V16.5" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M31.5 10V16.5" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M40 10V16.5" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M21.8 15.8C21.8 14.03 23.23 12.6 25 12.6C26.77 12.6 28.2 14.03 28.2 15.8"
        stroke="#0F172A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M30.3 15.8C30.3 14.03 31.73 12.6 33.5 12.6C35.27 12.6 36.7 14.03 36.7 15.8"
        stroke="#0F172A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M38.8 15.8C38.8 14.03 40.23 12.6 42 12.6C43.77 12.6 45.2 14.03 45.2 15.8"
        stroke="#0F172A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M24.5 29.94 30.05 35.49 39.65 25.89"
        stroke="#0F172A"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function UserCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18a6.5 6.5 0 0 1 11 0" />
    </Icon>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function SlidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 6h8" />
      <path d="M16 6h4" />
      <path d="M10 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M4 12h3" />
      <path d="M11 12h9" />
      <path d="M7 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M4 18h10" />
      <path d="M18 18h2" />
      <path d="M14 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    </Icon>
  );
}

export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20v-3" />
    </Icon>
  );
}

export function CalendarDaysIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </Icon>
  );
}
