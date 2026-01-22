'use client'

import { useParams } from "next/navigation"
import CardBarang from "@/components/Card-barang"

export default function Page() {
    const { id } = useParams()
    return <CardBarang id={Number(id)} />
}