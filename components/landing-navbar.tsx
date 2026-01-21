import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { Suspense } from "react";
import { Gavel } from "lucide-react";

export function LandingNavbar() {
    return (
        <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 z-50">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8 mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                        <Gavel size={20} />
                    </div>
                    <span>Lelang<span className="text-primary">Online</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="#beranda" className="text-muted-foreground hover:text-foreground transition-colors">
                        Beranda
                    </Link>
                    <Link href="#cara-kerja" className="text-muted-foreground hover:text-foreground transition-colors">
                        Cara Kerja
                    </Link>
                    <Link href="#lelang-terbaru" className="text-muted-foreground hover:text-foreground transition-colors">
                        Lelang Terbaru
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                </div>
            </div>
        </nav>
    );
}
