"use client"

import * as React from "react"
import {
    LayoutDashboardIcon,
    PackageIcon,
    HammerIcon,
    CreditCardIcon,
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

const navMain = [
    {
        title: "Dashboard",
        url: "/petugas/dashboard",
        icon: LayoutDashboardIcon,
    },
    {
        title: "Pendataan Barang",
        url: "/petugas/barang",
        icon: PackageIcon,
        items: [
            {
                title: "Daftar Barang",
                url: "/petugas/barang",
            },
            {
                title: "Tambah Barang",
                url: "/petugas/barang/create",
            },
        ],
    },
    {
        title: "Kelola Lelang",
        url: "/petugas/lelang",
        icon: HammerIcon,
        items: [
            {
                title: "Daftar Lelang",
                url: "/petugas/lelang",
            },
            {
                title: "Buka Lelang",
                url: "/petugas/lelang/buka",
            },
            {
                title: "Tutup Lelang",
                url: "/petugas/lelang/tutup",
            },
        ],
    },
    {
        title: "Validasi Pembayaran",
        url: "/petugas/pembayaran",
        icon: CreditCardIcon,
    },
    {
        title: "Laporan",
        url: "/petugas/laporan",
        icon: FileTextIcon,
        items: [
            {
                title: "Laporan Lelang",
                url: "/petugas/laporan/lelang",
            },
            {
                title: "Laporan Pembayaran",
                url: "/petugas/laporan/pembayaran",
            },
            {
                title: "Laporan Barang",
                url: "/petugas/laporan/barang",
            },
        ],
    },
]

const navSecondary: any[] = []

export function PetugasSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, loading } = useUser()

    const userData = {
        name: user?.user_metadata?.nama || user?.email?.split('@')[0] || "Petugas",
        email: user?.email || "petugas@lelang.com",
        avatar: user?.user_metadata?.avatar_url || "/avatars/petugas.jpg",
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
                            <a href="/petugas/dashboard">
                                <GavelIcon className="h-5 w-5" />
                                <span className="text-base font-semibold">Sistem Lelang Petugas</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
        </Sidebar>
    )
}
