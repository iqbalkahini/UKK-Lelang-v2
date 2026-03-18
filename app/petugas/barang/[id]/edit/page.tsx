'use client'

import { useParams } from "next/navigation"

export default function EditBarangPage({ params }: { params: { id: string } }) {
    const id = params.id
    return (
        <div>
            <h1>Edit Barang</h1>
            <p>ID: {id}</p>
        </div>
    )
}