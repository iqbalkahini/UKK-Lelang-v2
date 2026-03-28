"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getURL } from "@/lib/supabase/get-url";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [dataSignUp, setDataSignUp] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
    telp: "",
    repeatPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (dataSignUp.password !== dataSignUp.repeatPassword) {
      setError("Kata Sandi Tidak Sama");
      setIsLoading(false);
      return;
    }

    if (!dataSignUp.username) {
      setError("Username is required");

    }

    try {
      const { error } = await supabase.auth.signUp({
        email: dataSignUp.email,
        password: dataSignUp.password,
        options: {
          data: {
            nama: dataSignUp.nama,
            username: dataSignUp.username,
            telp: dataSignUp.telp,
          },
          emailRedirectTo: getURL("/auth/confirm"),
        },
      });
      if (error) throw error;
      router.push("/auth/login");
      toast.success("Akun berhasil dibuat. Silahkan Cek email untuk konfirmasi");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-[1.5rem] border-border/70 bg-transparent shadow-none">
        <CardHeader className="space-y-3 px-6 pb-6 pt-7 md:px-8">
          <div className="inline-flex w-fit items-center rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Registrasi
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Daftar
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-7 md:px-8">
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2.5 sm:col-span-2">
                  <Label htmlFor="nama" className="text-sm font-medium">
                    Nama
                  </Label>
                  <Input
                    id="nama"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={dataSignUp.nama}
                    onChange={(e) => setDataSignUp({ ...dataSignUp, nama: e.target.value })}
                    className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Nama Pengguna
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    required
                    value={dataSignUp.username}
                    onChange={(e) => setDataSignUp({ ...dataSignUp, username: e.target.value })}
                    className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="telp" className="text-sm font-medium">
                    Nomor Telepon
                  </Label>
                  <Input
                    id="telp"
                    type="text"
                    placeholder="08123456789"
                    required
                    value={dataSignUp.telp}
                    onChange={(e) => setDataSignUp({ ...dataSignUp, telp: e.target.value })}
                    className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                  />
                </div>
                <div className="grid gap-2.5 sm:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={dataSignUp.email}
                    onChange={(e) => setDataSignUp({ ...dataSignUp, email: e.target.value })}
                    className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                  />
                </div>
                <div className="grid gap-2.5">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Kata Sandi
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={dataSignUp.password}
                    onChange={(e) => setDataSignUp({ ...dataSignUp, password: e.target.value })}
                    className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                  />
                </div>
                <div className="grid gap-2.5">
                  <div className="flex items-center">
                    <Label htmlFor="repeat-password" className="text-sm font-medium">
                      Konfirmasi Kata Sandi
                    </Label>
                  </div>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={dataSignUp.repeatPassword}
                    onChange={(e) => setDataSignUp({ ...dataSignUp, repeatPassword: e.target.value })}
                    className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                  />
                </div>
              </div>
              {error && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="mt-1 h-11 w-full rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "Buat Akun..." : "Buat Akun"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Sudah Punya Akun?{" "}
              <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
