import { PetugasSidebar } from "@/components/petugas-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function PetugasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <PetugasSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
