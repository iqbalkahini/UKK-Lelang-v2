import Link from "next/link";
import { Gavel, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="bg-muted/50 border-t pt-16 pb-8">
            <div className="container px-4 mx-auto max-w-screen-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
                            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                                <Gavel size={20} />
                            </div>
                            <span>Lelang<span className="text-primary">Online</span></span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            Platform lelang terpercaya untuk menemukan barang unik dan antik dengan harga terbaik dan transparan.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook size={20} />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter size={20} />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram size={20} />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin size={20} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Menu</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#beranda" className="hover:text-foreground transition-colors">Beranda</Link></li>
                            <li><Link href="#lelang-terbaru" className="hover:text-foreground transition-colors">Lelang Terbaru</Link></li>
                            <li><Link href="#cara-kerja" className="hover:text-foreground transition-colors">Cara Kerja</Link></li>
                            <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Masuk</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Kategori</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Elektronik</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Fashion</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Kenyamanan Rumah</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Koleksi Antik</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Bantuan</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">FAQ</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Syarat & Ketentuan</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Hubungi Kami</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; 2026 LelangOnline. Hak Cipta Dilindungi.</p>
                </div>
            </div>
        </footer>
    );
}
