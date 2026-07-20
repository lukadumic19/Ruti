import {
  Baby,
  House,
  LayoutGrid,
  Menu,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Fælles kilde for bund- og sidenavigation (DESIGN_PRINCIPLES §2). */
export interface NavItem {
  href: string;
  labelKey: "home" | "rooms" | "scenes" | "baby" | "more";
  icon: LucideIcon;
}

export const navItems: readonly NavItem[] = [
  { href: "/", labelKey: "home", icon: House },
  { href: "/rum", labelKey: "rooms", icon: LayoutGrid },
  { href: "/scener", labelKey: "scenes", icon: Sparkles },
  { href: "/baby", labelKey: "baby", icon: Baby },
  { href: "/mere", labelKey: "more", icon: Menu },
] as const;

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
