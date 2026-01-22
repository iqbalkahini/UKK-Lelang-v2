"use client"

import * as React from "react"
import {
    LayoutDashboardIcon,
    SearchIcon,
    HandIcon,
    WalletIcon,
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

const data = {
    user: {
        name: "Masyarakat",
        email: "user@lelang.com",
        avatar: "/avatars/user.jpg",
    },
    navMain: [
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
            title: "Pembayaran",
            url: "/masyarakat/pembayaran",
            icon: WalletIcon,
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
    ],
    navSecondary: [],
}

export function MasyarakatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
