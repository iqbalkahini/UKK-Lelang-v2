"use client"

import {
    LayoutDashboardIcon,
    PackageIcon,
    FileTextIcon,
    GavelIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUser } from "@/hooks/useUser"
import { Suspense } from "react"

const navMain = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        title: "Pendataan Barang",
        url: "/admin/barang",
        icon: PackageIcon,
        items: [
            {
                title: "Daftar Barang",
                url: "/admin/barang",
            },
            {
                title: "Tambah Barang",
                url: "/admin/barang/create",
            },
        ],
    },
    {
        title: "Laporan",
        url: "/admin/laporan",
        icon: FileTextIcon,
        items: [
            {
                title: "Laporan Lelang",
                url: "/admin/laporan/lelang",
            },
            {
                title: "Laporan Pembayaran",
                url: "/admin/laporan/pembayaran",
            },
            {
                title: "Laporan Barang",
                url: "/admin/laporan/barang",
            },
        ],
    },
]

const navSecondary: any[] = []

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, loading } = useUser()

    const userData = {
        name: user?.user_metadata?.nama || user?.email?.split('@')[0] || "Administrator",
        email: user?.email || "admin@lelang.com",
        avatar: user?.user_metadata?.avatar_url || "/avatars/admin.jpg",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="/admin/dashboard">
                                <GavelIcon className="h-5 w-5" />
                                <span className="text-base font-semibold">Sistem Lelang Admin</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <Suspense>
                    <NavMain items={navMain} />
                </Suspense>
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
        </Sidebar>
    )
}
