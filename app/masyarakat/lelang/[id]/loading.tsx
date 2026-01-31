import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Loading() {
    return (
        <>
            <SiteHeader title="Detail Lelang" />
            <div className="container p-4 md:p-8 max-w-5xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" disabled>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Katalog
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                    </div>

                    {/* Right: Info Skeleton */}
                    <div className="space-y-6">
                        <div>
                            <Skeleton className="h-6 w-24 rounded-full mb-2" />
                            <Skeleton className="h-10 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>

                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </>
    );
}
