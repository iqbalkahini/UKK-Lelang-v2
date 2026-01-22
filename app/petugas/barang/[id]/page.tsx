'use client'

import { useParams } from "next/navigation"
import CardBarang from "@/components/Card-barang"
import { Suspense } from "react"

export default function Page() {
    const { id } = useParams()
    return <Suspense fallback={<div>Loading...</div>}><CardBarang id={Number(id)} /></Suspense>
}