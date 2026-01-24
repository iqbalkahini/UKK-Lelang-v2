'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"

export function PageLoading() {
    return (
        <>
            <SiteHeader title={'Loading'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="rounded-lg border p-4 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        </>
    )
}
