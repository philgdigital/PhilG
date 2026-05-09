import type { SVGProps } from "react";

/**
 * Hand-crafted icon set that replaces the 12 icons we used from
 * lucide-react. Identical visual style (24x24 viewBox, 1.75 stroke,
 * round caps and joins) but ships ~3KB of SVG instead of pulling in the
 * full 5,800-icon barrel-export package (~227KB chunk, ~487ms long task).
 *
 * Each icon is a tiny inline-SVG component that takes the same props as
 * any other svg, plus className so Tailwind sizing works:
 *   <ArrowUpRight className="w-5 h-5" />
 */
export type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = (props: IconProps) => React.ReactElement;

const baseProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Svg = (
  props: IconProps & { children: React.ReactNode },
): React.ReactElement => {
  const { children, ...rest } = props;
  return (
    <svg {...baseProps} {...rest} aria-hidden="true">
      {children}
    </svg>
  );
};

export const ArrowUpRight: IconComponent = (p) => (
  <Svg {...p}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </Svg>
);

export const ArrowUpLeft: IconComponent = (p) => (
  <Svg {...p}>
    <line x1="17" y1="17" x2="7" y2="7" />
    <polyline points="17 7 7 7 7 17" />
  </Svg>
);

export const XIcon: IconComponent = (p) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const Mail: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </Svg>
);

export const Sparkles: IconComponent = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M5 16l.9 2.1L8 19l-2.1.9L5 22l-.9-2.1L2 19l2.1-.9z" />
    <path d="M19 14l.6 1.4L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.6z" />
  </Svg>
);

export const Workflow: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="15" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <path d="M6 9v3a3 3 0 0 0 3 3" />
    <path d="M15 12v0a3 3 0 0 1 3 3v0" />
  </Svg>
);

export const Award: IconComponent = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" />
  </Svg>
);

export const Users: IconComponent = (p) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

export const Globe: IconComponent = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20z" />
  </Svg>
);

export const Code2: IconComponent = (p) => (
  <Svg {...p}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Svg>
);

export const Cpu: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="2" x2="9" y2="4" />
    <line x1="15" y1="2" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="22" />
    <line x1="15" y1="20" x2="15" y2="22" />
    <line x1="20" y1="9" x2="22" y2="9" />
    <line x1="20" y1="14" x2="22" y2="14" />
    <line x1="2" y1="9" x2="4" y2="9" />
    <line x1="2" y1="14" x2="4" y2="14" />
  </Svg>
);

export const Smartphone: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </Svg>
);
