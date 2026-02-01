import { PetugasSidebar } from "@/components/petugas-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Suspense } from "react"

export default function PetugasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <PetugasSidebar />
            <SidebarInset>
                <Suspense>
                    {children}
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    )
}
