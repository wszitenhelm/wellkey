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
    <nav className="sticky bottom-0 mt-auto border-t border-border/60 bg-background/95 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2 px-3 py-3">
        {tabs.map((tab) => {
          const active = currentPath === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-full px-3 py-2.5 text-xs font-semibold transition",
                active
                  ? "bg-accent text-accentForeground shadow-soft"
                  : "text-muted hover:bg-white/80"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
