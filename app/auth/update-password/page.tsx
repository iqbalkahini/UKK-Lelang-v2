import { UpdatePasswordForm } from "@/components/update-password-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";


export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Memuat...</p>}>
          <UpdatePasswordContent />
        </Suspense>
      </div>
    </div>
  );
}

async function UpdatePasswordContent() {

  return <UpdatePasswordForm />;
}
