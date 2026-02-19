import ThemeToggle from "@/components/ThemeToggle";
import { CloudSun } from "lucide-react";
import { type ReactNode } from "react";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background p-4">
      <header className="border-b ">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 font-semibold">
            <CloudSun className="h-6 w-6 text-primary" />
            <p>Meteo Dashboard</p>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
