"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PetugasError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[Petugas Error]:", error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Petugas: Something went wrong!</h2>
                <p className="text-muted-foreground">
                    An error occurred in the petugas panel.
                </p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" asChild>
                    <Link href="/petugas/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        </div>
    )
}
