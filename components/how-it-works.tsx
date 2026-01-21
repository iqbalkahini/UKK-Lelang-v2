import { UserPlus, Gavel, Trophy } from "lucide-react";

const steps = [
    {
        id: 1,
        title: "Daftar Akun",
        description: "Buat akun gratis dan verifikasi identitas Anda untuk mulai berpartisipasi.",
        icon: <UserPlus className="w-10 h-10 text-primary" />,
    },
    {
        id: 2,
        title: "Mulai Menawar",
        description: "Cari barang impian Anda dan ajukan penawaran terbaik sebelum waktu habis.",
        icon: <Gavel className="w-10 h-10 text-primary" />,
    },
    {
        id: 3,
        title: "Menangkan Barang",
        description: "Jika tawaran Anda tertinggi, selesaikan pembayaran dan barang jadi milik Anda.",
        icon: <Trophy className="w-10 h-10 text-primary" />,
    },
];

export function HowItWorks() {
    return (
        <section id="cara-kerja" className="py-24 bg-background">
            <div className="container px-4 mx-auto max-w-screen-xl text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Bagaimana Cara Kerjanya?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-16">
                    Proses lelang yang mudah, transparan, dan aman untuk semua orang.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-0.5 bg-border -z-10" />

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center bg-background">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border-4 border-background ring-1 ring-border shadow-sm">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed px-6">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
