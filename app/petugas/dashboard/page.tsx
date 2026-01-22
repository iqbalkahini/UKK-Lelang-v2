'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { BarangTable } from "@/components/barang-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Suspense } from "react"

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar variant="floating" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {/* <SectionCards /> */}
                            <div className="px-4 lg:px-6">
                                <ChartAreaInteractive />
                            </div>
                            <div className="px-4 lg:px-6">
                                <Suspense fallback={<div>Loading...</div>}>
                                    <BarangTable />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
