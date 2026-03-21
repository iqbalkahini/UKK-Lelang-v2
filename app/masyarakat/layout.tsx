import { MasyarakatSidebar } from "@/components/masyarakat-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Suspense } from "react"

export default function MasyarakatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <MasyarakatSidebar />
            <SidebarInset>
                <Suspense>
                    {children}
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    )
}
