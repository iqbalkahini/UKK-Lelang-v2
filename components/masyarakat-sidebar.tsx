"use client"

import {
    LayoutDashboardIcon,
    SearchIcon,
    HandIcon,
    WalletIcon,
    GavelIcon,
    ReceiptIcon,
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
        url: "/masyarakat/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        title: "Lelang Aktif",
        url: "/masyarakat/lelang",
        icon: SearchIcon,
    },
    {
        title: "Penawaran Saya",
        url: "/masyarakat/penawaran",
        icon: HandIcon,
    },
    {
        title: "Dompet",
        url: "/masyarakat/dompet",
        icon: WalletIcon,
    },
    {
        title: "Pembayaran",
        url: "/masyarakat/pembayaran",
        icon: ReceiptIcon,
        items: [
            {
                title: "Menang Lelang",
                url: "/masyarakat/pembayaran/wins",
            },
            {
                title: "Riwayat Pembayaran",
                url: "/masyarakat/pembayaran/history",
            },
        ],
    },
]

const navSecondary: any[] = []

export function MasyarakatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, loading } = useUser()

    const userData = {
        name: user?.user_metadata?.nama || user?.email?.split('@')[0] || "User",
        email: user?.email || "user@lelang.com",
        avatar: user?.user_metadata?.avatar_url || "/avatars/user.jpg",
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
                            <a href="/masyarakat/dashboard">
                                <GavelIcon className="h-5 w-5" />
                                <span className="text-base font-semibold">Sistem Lelang</span>
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
