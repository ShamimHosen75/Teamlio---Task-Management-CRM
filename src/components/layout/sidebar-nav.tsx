import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { NAV_SECTIONS } from "@/app/navigation";
import { usePermissions } from "@/app/workspace";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { can } = usePermissions();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [closed, setClosed] = useState<string[]>([]);

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((section) => section.items.length > 0);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav className="scrollbar-sidebar min-h-0 flex-1 touch-pan-y space-y-5 overflow-y-auto overscroll-y-contain px-3 py-4 [-webkit-overflow-scrolling:touch]">
      {sections.map((section) => {
        const isClosed = closed.includes(section.label);
        return (
          <div key={section.label}>
            {!collapsed ? (
              <button
                type="button"
                onClick={() =>
                  setClosed((c) =>
                    c.includes(section.label) ? c.filter((s) => s !== section.label) : [...c, section.label],
                  )
                }
                className="mb-1 flex min-h-11 w-full items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground lg:min-h-0 lg:py-1"
              >
                {section.label}
                <ChevronDown className={cn("size-3 transition-transform", isClosed && "-rotate-90")} />
              </button>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-border" />
            )}

            {!isClosed || collapsed ? (
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.to);
                  const link = (
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  );
                  return (
                    <li key={item.to}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
