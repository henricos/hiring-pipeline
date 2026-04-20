"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Briefcase, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Perfis", href: "/profiles", icon: Users, disabled: false },
  { label: "Vagas", href: "/vacancies", icon: Briefcase, disabled: false },
  { label: "Configurações", href: "/settings", icon: Settings, disabled: false },
];

interface LeftRailProps {
  onNavigationStart?: () => void;
}

export function LeftRail({ onNavigationStart }: LeftRailProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2" aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.disabled) {
          return (
            <span
              key={item.href}
              className="flex items-center gap-3 px-2 py-2 rounded-sm cursor-not-allowed text-on-surface/30"
              aria-disabled="true"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate">{item.label}</span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigationStart}
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-sm text-sm transition-colors",
              isActive
                ? "bg-surface-container text-on-surface"
                : "text-on-surface/70 hover:bg-surface-container/60 hover:text-on-surface"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
