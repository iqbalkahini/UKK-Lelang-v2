import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="landing-grid absolute inset-0 opacity-30" />
      <div className="landing-orb landing-orb-1 opacity-40" />
      <div className="landing-orb landing-orb-2 opacity-30" />
      <div className="landing-beam landing-beam-2 opacity-50" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-6xl items-center px-6 py-10 md:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="animate-fade-up hidden max-w-xl lg:block">
            <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
              SISTEM LELANG
            </div>

            <div className="mt-6 space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                Bergabung dan mulai gunakan sistem lelang.
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Buat akun baru untuk melanjutkan proses pendaftaran dan akses
                fitur sesuai kebutuhan Anda.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="landing-panel animate-fade-up animation-delay-1 rounded-2xl border border-border/60 bg-card/85 p-5 backdrop-blur-md">
                <p className="text-sm font-medium text-foreground">Langkah awal</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Lengkapi data akun Anda dengan benar agar proses pendaftaran
                  berjalan lancar.
                </p>
              </div>
              <div className="landing-panel animate-fade-up animation-delay-2 rounded-2xl border border-border/60 bg-card/85 p-5 backdrop-blur-md">
                <p className="text-sm font-medium text-foreground">Siap digunakan</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Setelah mendaftar, Anda bisa melanjutkan verifikasi dan masuk
                  ke sistem.
                </p>
              </div>
            </div>
          </section>

          <div className="animate-fade-up animation-delay-1 relative mx-auto w-full max-w-lg">
            <div className="landing-panel absolute inset-0 rounded-[2rem] bg-primary/5 blur-2xl" />
            <div className="relative rounded-[2rem] border border-border/70 bg-card/90 p-3 shadow-[0_24px_80px_-48px_hsl(var(--foreground)/0.45)] backdrop-blur-xl">
              <SignUpForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
