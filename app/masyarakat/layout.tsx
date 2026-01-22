import { MasyarakatSidebar } from "@/components/masyarakat-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function MasyarakatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <MasyarakatSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
