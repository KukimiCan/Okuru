import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={20}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={20}
      {...props}
    />
  );
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3.5 10.5 12 3l8.5 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </Icon>
  );
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c.5 2.8 1.6 4.7 4.5 5.5-2.9.8-4 2.7-4.5 5.5-.5-2.8-1.6-4.7-4.5-5.5 2.9-.8 4-2.7 4.5-5.5z" />
      <path d="M18.5 14.5c.3 1.5.9 2.5 2.5 3-1.6.5-2.2 1.5-2.5 3-.3-1.5-.9-2.5-2.5-3 1.6-.5 2.2-1.5 2.5-3z" />
    </Icon>
  );
}

export function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  );
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.5A1.5 1.5 0 0 0 5 20" />
      <path d="M5 4.5v15.5A1.5 1.5 0 0 0 6.5 21.5H19" />
    </Icon>
  );
}

export function PlusCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </Icon>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6 18.2a6.5 6.5 0 0 1 12 0" />
    </Icon>
  );
}

export function GiftMarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon height={24} width={24} {...props}>
      <rect height="11" rx="1.5" width="17" x="3.5" y="9.5" />
      <path d="M3.5 13H20.5" />
      <path d="M12 9.5v11" />
      <path d="M12 9.5C12 7 10.5 5.5 8.8 5.5 7.3 5.5 6 6.6 6 8c0 1 .8 1.5 2 1.5z" />
      <path d="M12 9.5c0-2.5 1.5-4 3.2-4 1.5 0 2.8 1.1 2.8 2.5 0 1-.8 1.5-2 1.5z" />
    </Icon>
  );
}
