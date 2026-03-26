import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Suspense } from "react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <Suspense>
                    {children}
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    )
}
