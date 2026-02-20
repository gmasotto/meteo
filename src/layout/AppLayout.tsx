import ThemeToggle from "@/components/ThemeToggle";
import { type ReactNode } from "react";

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background p-4">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 font-semibold">
            <img
              src="/favicon.svg"
              alt="Meteo logo"
              className="h-8 w-8 rounded-xl"
            />
            <p>Meteo Dashboard</p>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default AppLayout;
