import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
    return (
        <>
            <SiteHeader title={'Lelang Aktif'} />
            <div className="container p-4 md:p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Lelang Aktif</h1>
                    <p className="text-muted-foreground">Temukan barang impian Anda dan mulai menawar.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-xl border bg-card text-card-foreground shadow space-y-4">
                            <Skeleton className="aspect-video w-full rounded-t-xl" />
                            <div className="p-6 pt-0 space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                                <div className="pt-4 border-t">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
