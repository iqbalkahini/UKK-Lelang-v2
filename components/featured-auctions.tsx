import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Timer, Heart } from "lucide-react";
import Image from "next/image";

// Mock Data
const auctions = [
    {
        id: 1,
        title: "Sony PlayStation 5 Digital Edition",
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600&auto=format&fit=crop",
        currentBid: "Rp 4.500.000",
        bids: 12,
        timeLeft: "2j 15m",
        category: "Elektronik"
    },
    {
        id: 2,
        title: "Jam Tangan Vintage Seiko 1980",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop",
        currentBid: "Rp 1.250.000",
        bids: 8,
        timeLeft: "45m 20d",
        category: "Fashion"
    },
    {
        id: 3,
        title: "MacBook Pro M1 2020 13-inch",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop",
        currentBid: "Rp 11.000.000",
        bids: 24,
        timeLeft: "5j 10m",
        category: "Laptop"
    },
    {
        id: 4,
        title: "Kamera Analog Canon AE-1",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
        currentBid: "Rp 2.100.000",
        bids: 5,
        timeLeft: "1j 30m",
        category: "Fotografi"
    }
];

export function FeaturedAuctions() {
    return (
        <section id="lelang-terbaru" className="py-20 bg-muted/30">
            <div className="container px-4 mx-auto max-w-screen-2xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Penawaran Hangat 🔥</h2>
                        <p className="text-muted-foreground">Barang-barang paling diminati yang akan segera berakhir.</p>
                    </div>
                    <Button variant="outline">Lihat Semua Lelang</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {auctions.map((item) => (
                        <Card key={item.id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card">
                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                {/* Fallback image if remote image fails, though using standard img tag for simplicity with external urls in this demo */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <Badge className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur-md border-0">{item.category}</Badge>
                                <Button size="icon" variant="ghost" className="absolute top-3 left-3 h-8 w-8 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Heart className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex justify-between items-end mt-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Penawaran Tertinggi</p>
                                        <p className="text-lg font-bold text-primary">{item.currentBid}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">{item.bids} tawaran</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 border-t bg-muted/20 flex justify-between items-center text-sm">
                                <div className="flex items-center text-orange-500 font-medium animate-pulse">
                                    <Timer className="mr-1.5 h-4 w-4" />
                                    {item.timeLeft}
                                </div>
                                <Button size="sm">Tawar Sekarang</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
