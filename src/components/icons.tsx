type IconProps = { size?: number; color?: string };

export function IconShirt({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 3 7l2.5 3L7 9v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9l1.5 1L21 7l-5-4a3 3 0 0 1-4 2 3 3 0 0 1-4-2Z" />
    </svg>
  );
}

export function IconBall({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5 15.5 10l-1.3 4h-4.4L8.5 10Z" />
      <path d="M12 7.5V4.3M15.5 10l3-2M14.2 14l1.8 3.2M9.8 14l-1.8 3.2M8.5 10l-3-2" />
    </svg>
  );
}

export function IconWhistle({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="1.5" fill={color} stroke="none" />
      <path d="M11 8.2C13.5 9 15.5 7.5 17 5.5c1.5 2 1.5 5-1 6.6-2 1.3-4.4 1-6-1" />
      <path d="M6 12a5 5 0 0 0 6 4.9 5 5 0 0 0 4-3.9" />
      <path d="M6 12a5 5 0 1 1 8.5-3.6" />
    </svg>
  );
}

export function IconChartBar({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M12 20V4M20 20v-7" />
      <path d="M2 20h20" />
    </svg>
  );
}

export function IconShield({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5 5.5V11c0 4.8 3 8.4 7 10 4-1.6 7-5.2 7-10V5.5Z" />
      <path d="M12 8v5M9.5 10.5h5" />
    </svg>
  );
}

export function IconStarFilled({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 3.2 14.7 9l6.3.6-4.7 4.2 1.4 6.2L12 16.9 6.3 20l1.4-6.2L3 9.6 9.3 9Z" />
    </svg>
  );
}

export function IconLogout({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconPlus({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconUsers({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.3c2.5.4 4.5 2.4 4.5 5.2" />
    </svg>
  );
}

export function IconCalendar({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
