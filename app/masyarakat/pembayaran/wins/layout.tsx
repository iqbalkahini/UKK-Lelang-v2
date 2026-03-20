import { Suspense } from "react"

export default function WinsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense>
            {children}
        </Suspense>
    )
}