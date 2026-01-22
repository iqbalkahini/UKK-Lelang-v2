'use client'

import CardBarang from "@/components/Card-barang"
import { Suspense } from "react"

export default function Page() {
    return <Suspense fallback={<div>Loading...</div>}><CardBarang /></Suspense>
}