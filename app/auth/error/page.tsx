import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { AuthErrorMessage } from "@/components/auth-error-message";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-4">
      <AuthErrorMessage />

      {params?.error && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            System Message
          </p>
          <p className="text-sm text-foreground">{params.error}</p>
        </div>
      )}
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
