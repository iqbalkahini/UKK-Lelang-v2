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
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  // const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  // const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login berhasil");

      // Navigate to root - middleware will redirect to correct dashboard based on role
      // No need for router.refresh() because session is already in cookies
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      toast.error("Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-[1.5rem] border-border/70 bg-transparent shadow-none">
        <CardHeader className="space-y-3 px-6 pb-6 pt-7 md:px-8">
          <div className="inline-flex w-fit items-center rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Login
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Masuk
          </CardTitle>
          <CardDescription className="max-w-sm text-sm leading-6">
            Masukkan email dan password Anda untuk mengakses sistem lelang.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-7 md:px-8">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                />
              </div>
              <div className="grid gap-2.5">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border/70 bg-background/80 px-4 shadow-none transition-all focus-visible:ring-2"
                />
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
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Belum Punya Akun?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Daftar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
