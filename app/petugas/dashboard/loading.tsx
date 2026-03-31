import { Skeleton } from "@/components/ui/skeleton"
import { SectionCardsSkeleton } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Loading() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full">
        
        {/* 1. Overview Cards Skeleton */}
        <div className="mb-2">
          <SectionCardsSkeleton />
        </div>

        {/* 2. Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart Skeleton (Kiri, lebih lebar) */}
          <Card className="lg:col-span-2 @container/card">
            <CardHeader className="relative">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <Skeleton className="aspect-auto h-[250px] w-full" />
            </CardContent>
          </Card>

          {/* Pie Chart Skeleton (Kanan) */}
          <Card className="lg:col-span-1 flex flex-col h-full border shadow-xs">
            <CardHeader className="items-center pb-0">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
              <Skeleton className="mx-auto aspect-square w-full max-w-[250px] rounded-full" />
            </CardContent>
          </Card>
        </div>

        {/* 3. Tabel Aktivitas Terbaru Skeleton */}
        <Card className="border shadow-xs mt-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6">Barang & Tgl</TableHead>
                  <TableHead className="text-right">Harga Akhir</TableHead>
                  <TableHead className="pr-6 text-center">Pemenang</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-center">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
