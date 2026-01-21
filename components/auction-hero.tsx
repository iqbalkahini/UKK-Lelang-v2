import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Zap, ShieldCheck } from "lucide-react";

export function AuctionHero() {
    return (
        <section id="beranda" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 bg-muted/50 border border-muted px-3 py-1 rounded-full text-xs font-medium mb-6 text-foreground/80">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Platform Lelang Terpercaya #1 di Indonesia
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 mb-6 max-w-4xl leading-tight">
                    Temukan Barang Unik & <br className="hidden md:block" />
                    <span className="text-primary">Menangkan Penawaran Terbaik</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                    Bergabunglah dengan ribuan kolektor dan pemburu barang langka dalam komunitas lelang paling aman dan transparan. Tawar mulai dari Rp10.000!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25" asChild>
                        <Link href="/auth/sign-up">
                            Mulai Menawar <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base backdrop-blur-sm bg-background/50" asChild>
                        <Link href="#cara-kerja">
                            Pelajari Cara Kerja
                        </Link>
                    </Button>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 md:gap-16 text-muted-foreground opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-semibold">Verifikasi Ketat</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        <span className="text-sm font-semibold">Real-time Bidding</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
