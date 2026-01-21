"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
          emailRedirectTo: `${window.location.origin}/protected`,
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daftar</CardTitle>
          <CardDescription>Buat Akun Baru</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={dataSignUp.nama}
                  onChange={(e) => setDataSignUp({ ...dataSignUp, nama: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Nama Pengguna</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  value={dataSignUp.username}
                  onChange={(e) => setDataSignUp({ ...dataSignUp, username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={dataSignUp.email}
                  onChange={(e) => setDataSignUp({ ...dataSignUp, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telp">Nomor Telepon</Label>
                <Input
                  id="telp"
                  type="text"
                  placeholder="08123456789"
                  required
                  value={dataSignUp.telp}
                  onChange={(e) => setDataSignUp({ ...dataSignUp, telp: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Kata Sandi</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={dataSignUp.password}
                  onChange={(e) => setDataSignUp({ ...dataSignUp, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Konfirmasi Kata Sandi</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={dataSignUp.repeatPassword}
                  onChange={(e) => setDataSignUp({ ...dataSignUp, repeatPassword: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Buat Akun..." : "Buat Akun"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Sudah Punya Akun?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
