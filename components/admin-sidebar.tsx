"use client"

import * as React from "react"
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

const data = {
    user: {
        name: "Administrator",
        email: "admin@lelang.com",
        avatar: "/avatars/admin.jpg",
    },
    navMain: [
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
    ],
    navSecondary: [],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
