import type { ReactNode } from "react";
import { MobileAppShell } from "@/components/app/mobile-app-shell";
import { ScreenHeader } from "@/components/app/screen-header";

type AppScreenProps = {
  children: ReactNode;
  currentPath: string;
  description?: string;
  title?: string;
};

export function AppScreen({
  children,
  currentPath,
  description,
  title
}: AppScreenProps) {
  return (
    <MobileAppShell currentPath={currentPath}>
      {title && description ? <ScreenHeader description={description} title={title} /> : null}
      {children}
    </MobileAppShell>
  );
}
