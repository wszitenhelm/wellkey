import Link from "next/link";
import { LayoutGrid, MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomTabNavProps = {
  currentPath: string;
};

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/chat", label: "Chat", icon: MessageSquareText },
  { href: "/habits", label: "Habits", icon: Sparkles }
] as const;

export function BottomNav({ currentPath }: BottomTabNavProps) {
  return (
    <nav className="sticky bottom-0 mt-auto border-t border-border/50 bg-background/92 pb-[calc(env(safe-area-inset-bottom,0px)+0.45rem)] shadow-[0_-8px_28px_rgba(26,26,26,0.06)] backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2 px-2.5 py-2.5">
        {tabs.map((tab) => {
          const active = currentPath === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-[3.75rem] flex-col items-center justify-center rounded-full px-3 py-2 text-[11px] font-semibold leading-none transition",
                active
                  ? "bg-accent text-accentForeground shadow-soft"
                  : "text-muted hover:bg-white/80"
              )}
            >
              <Icon className="h-[1.05rem] w-[1.05rem]" />
              <span className="mt-1.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
