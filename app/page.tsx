import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Gavel,
  Orbit,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing-navbar";
import { HowItWorks } from "@/components/how-it-works";
import { LandingFooter } from "@/components/landing-footer";
import { FeaturedAuctions } from "@/components/featured-auctions";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-grid absolute inset-0 opacity-60" />
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-beam landing-beam-1" />
        <div className="landing-beam landing-beam-2" />
      </div>

      <LandingNavbar />

      <div className="relative flex-1">
        <section
          id="beranda"
          className="relative isolate overflow-hidden px-4 pb-14 pt-24 md:px-8 md:pb-20 md:pt-28 lg:pt-24"
        >
          <div className="mx-auto grid max-w-screen-2xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] xl:gap-12">
            <div className="space-y-6 lg:space-y-7">
              <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-4 py-2 text-sm font-medium text-foreground/80 shadow-[0_10px_40px_-24px_hsl(var(--foreground))] backdrop-blur-xl">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.7)]" />
                Lelang digital yang terasa cepat, aman, dan meyakinkan
              </div>

              <div className="space-y-4 lg:space-y-5">
                <h1 className="animate-fade-up animation-delay-1 max-w-4xl text-4xl font-black leading-[0.92] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
                  Sistem lelang online
                  <span className="block bg-gradient-to-r from-primary via-foreground to-primary/60 bg-clip-text text-transparent">
                    yang simpel,
                  </span>
                  cepat, dan real-time.
                </h1>

                <p className="animate-fade-up animation-delay-2 max-w-2xl text-base leading-7 text-muted-foreground sm:text-[1.05rem]">
                  Pantau harga, kelola penawaran, dan ikuti proses lelang
                  dalam satu tampilan yang jelas dan mudah digunakan.
                </p>
              </div>

              <div className="animate-fade-up flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-full px-6 shadow-[0_18px_45px_-20px_hsl(var(--foreground))]"
                >
                  <Link href="/auth/sign-up">
                    Mulai Menawar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full border-border/60 bg-background/70 px-6 backdrop-blur-xl"
                >
                  <Link href="#lelang-terbaru">Lihat Lelang Populer</Link>
                </Button>
              </div>

              <div className="animate-fade-up animation-delay-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-background/70 p-3.5 shadow-[0_18px_40px_-30px_hsl(var(--foreground))] backdrop-blur-xl">
                  <div className="text-xl font-bold">24K+</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    penawar aktif yang terlibat setiap bulan
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-background/70 p-3.5 shadow-[0_18px_40px_-30px_hsl(var(--foreground))] backdrop-blur-xl">
                  <div className="text-xl font-bold">98%</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    transaksi selesai dengan verifikasi aman
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-background/70 p-3.5 shadow-[0_18px_40px_-30px_hsl(var(--foreground))] backdrop-blur-xl">
                  <div className="text-xl font-bold">&lt; 2 detik</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    pembaruan tawaran terasa nyaris seketika
                  </p>
                </div>
              </div>
            </div>

            <div className="relative lg:-mt-8">
              <div className="landing-panel animate-fade-up animation-delay-2 relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/70 p-4 shadow-[0_30px_100px_-45px_hsl(var(--foreground))] backdrop-blur-2xl md:p-5 xl:p-6">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Lelang unggulan hari ini
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
                      Kamera Analog Leica M3
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Gavel className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4 md:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Penawaran saat ini
                      </p>
                      <p className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                        Rp8.450.000
                      </p>
                    </div>
                    <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      17 tawaran aktif
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progres minat</span>
                      <span className="font-medium">84%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="landing-progress h-full w-[84%] rounded-full bg-gradient-to-r from-primary via-primary/80 to-amber-500" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-3.5">
                      <BadgeCheck className="mb-3 h-5 w-5 text-primary" />
                      <p className="text-sm font-medium">Terverifikasi</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Pemeriksaan data penjual dan barang dilakukan lebih dulu.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-3.5">
                      <Orbit className="mb-3 h-5 w-5 text-primary" />
                      <p className="text-sm font-medium">Dinamis</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Ritme penawaran divisualkan dengan pembaruan yang lebih hidup.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-3.5">
                      <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                      <p className="text-sm font-medium">Aman</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Session dan proses autentikasi dirancang lebih konsisten.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="rounded-2xl border border-border/50 bg-background/70 p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Aktivitas pasar</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          126 item baru masuk dalam 24 jam terakhir
                        </p>
                      </div>
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm font-medium">
                    Berakhir 01j 12m
                  </div>
                </div>
              </div>

              <div className="landing-float-card landing-float-card-1 hidden rounded-2xl border border-border/60 bg-background/85 p-4 shadow-[0_30px_80px_-40px_hsl(var(--foreground))] backdrop-blur-xl md:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Waves className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lonjakan tawaran</p>
                    <p className="text-xs text-muted-foreground">
                      9 penawaran masuk dalam 10 menit terakhir
                    </p>
                  </div>
                </div>
              </div>

              <div className="landing-float-card landing-float-card-2 hidden rounded-2xl border border-border/60 bg-background/85 p-4 shadow-[0_30px_80px_-40px_hsl(var(--foreground))] backdrop-blur-xl lg:block">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Live insight
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Penawaran tertinggi bergerak naik 23% minggu ini.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 md:px-8">
          <div className="mx-auto grid max-w-screen-2xl gap-4 rounded-[2rem] border border-border/50 bg-background/60 p-4 backdrop-blur-xl md:grid-cols-3 md:p-6">
            <div className="rounded-[1.5rem] border border-border/40 bg-muted/30 p-5">
              <p className="text-sm font-medium">Kurasi barang</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Item pilihan dari kategori elektronik, koleksi, fashion, hingga
                perangkat kerja bernilai tinggi.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/40 bg-muted/30 p-5">
              <p className="text-sm font-medium">Visual yang lebih tenang</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Lapisan blur, grid, dan gradien membantu halaman terasa premium
                tanpa mengganggu keterbacaan.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/40 bg-muted/30 p-5">
              <p className="text-sm font-medium">Interaksi halus</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Gerak elemen dibuat bertahap dan lembut agar halaman terasa aktif
                namun tetap nyaman dipandang.
              </p>
            </div>
          </div>
        </section>

        <FeaturedAuctions />
        <HowItWorks />
      </div>
      <LandingFooter />
    </main>
  );
}
