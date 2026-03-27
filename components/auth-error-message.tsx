"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthErrorMessage() {
  const [hashError, setHashError] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    // Supabase redirects errors to the hash fragment (#)
    // Example: #error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");

    if (errorCode || errorDescription) {
      let title = "Authentication Error";
      let description = errorDescription || "An unknown error occurred.";

      if (errorCode === "otp_expired") {
        title = "Link Expired";
        description =
          "The single-use link you clicked has expired or has already been used. Please request a new password reset link.";
      } else if (errorCode === "access_denied") {
        title = "Access Denied";
      }

      setHashError({ title, description });
    }
  }, []);

  if (!hashError) return null;

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{hashError.title}</AlertTitle>
        <AlertDescription>{hashError.description}</AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/forgot-password">Request New Reset Link</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
