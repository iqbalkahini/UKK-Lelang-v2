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

const data = {
    user: {
        name: "Petugas",
        email: "petugas@lelang.com",
        avatar: "/avatars/petugas.jpg",
    },
    navMain: [
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
    ],
    navSecondary: [],
}

export function PetugasSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
