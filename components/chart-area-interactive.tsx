"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Dummy Data for Valuation (Option 1)
const chartData = [
  { date: "2024-04-01", harga_akhir: 2500000, harga_awal: 1500000 },
  { date: "2024-04-02", harga_akhir: 3100000, harga_awal: 2000000 },
  { date: "2024-04-03", harga_akhir: 1800000, harga_awal: 1200000 },
  { date: "2024-04-04", harga_akhir: 4200000, harga_awal: 2800000 },
  { date: "2024-04-05", harga_akhir: 5500000, harga_awal: 3500000 },
  { date: "2024-04-06", harga_akhir: 6200000, harga_awal: 4000000 },
  { date: "2024-04-07", harga_akhir: 3500000, harga_awal: 2200000 },
  { date: "2024-04-08", harga_akhir: 7800000, harga_awal: 5000000 },
  { date: "2024-04-09", harga_akhir: 1200000, harga_awal: 900000 },
  { date: "2024-04-10", harga_akhir: 4500000, harga_awal: 3000000 },
  { date: "2024-04-11", harga_akhir: 5200000, harga_awal: 3800000 },
  { date: "2024-04-12", harga_akhir: 4800000, harga_awal: 3200000 },
  { date: "2024-04-13", harga_akhir: 6000000, harga_awal: 4500000 },
  { date: "2024-04-14", harga_akhir: 2800000, harga_awal: 1800000 },
  { date: "2024-04-15", harga_akhir: 2500000, harga_awal: 1500000 },
  { date: "2024-04-16", harga_akhir: 3000000, harga_awal: 2000000 },
  { date: "2024-04-17", harga_akhir: 8500000, harga_awal: 5500000 },
  { date: "2024-04-18", harga_akhir: 6800000, harga_awal: 4200000 },
  { date: "2024-04-19", harga_akhir: 4200000, harga_awal: 2800000 },
  { date: "2024-04-20", harga_akhir: 1500000, harga_awal: 1000000 },
  { date: "2024-04-21", harga_akhir: 2800000, harga_awal: 1900000 },
  { date: "2024-04-22", harga_akhir: 4100000, harga_awal: 2700000 },
  { date: "2024-04-23", harga_akhir: 3200000, harga_awal: 2100000 },
  { date: "2024-04-24", harga_akhir: 7500000, harga_awal: 4800000 },
  { date: "2024-04-25", harga_akhir: 4300000, harga_awal: 2900000 },
  { date: "2024-04-26", harga_akhir: 1800000, harga_awal: 1100000 },
  { date: "2024-04-27", harga_akhir: 6900000, harga_awal: 4700000 },
  { date: "2024-04-28", harga_akhir: 2900000, harga_awal: 1700000 },
  { date: "2024-04-29", harga_akhir: 5800000, harga_awal: 3600000 },
  { date: "2024-04-30", harga_akhir: 8200000, harga_awal: 5300000 },
  { date: "2024-05-01", harga_akhir: 3500000, harga_awal: 2200000 },
  { date: "2024-05-02", harga_akhir: 5100000, harga_awal: 3400000 },
  { date: "2024-05-03", harga_akhir: 4600000, harga_awal: 2800000 },
  { date: "2024-05-04", harga_akhir: 7200000, harga_awal: 4600000 },
  { date: "2024-05-05", harga_akhir: 8800000, harga_awal: 5700000 },
  { date: "2024-05-06", harga_akhir: 9500000, harga_awal: 6200000 },
  { date: "2024-05-07", harga_akhir: 6800000, harga_awal: 4100000 },
  { date: "2024-05-08", harga_akhir: 3100000, harga_awal: 1900000 },
  { date: "2024-05-09", harga_akhir: 4500000, harga_awal: 2800000 },
  { date: "2024-05-10", harga_akhir: 5900000, harga_awal: 3700000 },
  { date: "2024-05-11", harga_akhir: 6300000, harga_awal: 3900000 },
  { date: "2024-05-12", harga_akhir: 4200000, harga_awal: 2600000 },
  { date: "2024-05-13", harga_akhir: 3800000, harga_awal: 2100000 },
  { date: "2024-05-14", harga_akhir: 8900000, harga_awal: 5500000 },
  { date: "2024-05-15", harga_akhir: 8500000, harga_awal: 5100000 },
  { date: "2024-05-16", harga_akhir: 6700000, harga_awal: 4400000 },
  { date: "2024-05-17", harga_akhir: 9200000, harga_awal: 6000000 },
  { date: "2024-05-18", harga_akhir: 6400000, harga_awal: 4000000 },
  { date: "2024-05-19", harga_akhir: 4700000, harga_awal: 2900000 },
  { date: "2024-05-20", harga_akhir: 3500000, harga_awal: 2300000 },
  { date: "2024-05-21", harga_akhir: 1900000, harga_awal: 1100000 },
  { date: "2024-05-22", harga_akhir: 1800000, harga_awal: 1100000 },
  { date: "2024-05-23", harga_akhir: 5200000, harga_awal: 3300000 },
  { date: "2024-05-24", harga_akhir: 5800000, harga_awal: 3600000 },
  { date: "2024-05-25", harga_akhir: 4200000, harga_awal: 2700000 },
  { date: "2024-05-26", harga_akhir: 4500000, harga_awal: 2800000 },
  { date: "2024-05-27", harga_akhir: 8400000, harga_awal: 5300000 },
  { date: "2024-05-28", harga_akhir: 4900000, harga_awal: 3100000 },
  { date: "2024-05-29", harga_akhir: 1800000, harga_awal: 1100000 },
  { date: "2024-05-30", harga_akhir: 7100000, harga_awal: 4400000 },
  { date: "2024-05-31", harga_akhir: 3900000, harga_awal: 2500000 },
  { date: "2024-06-01", harga_akhir: 3800000, harga_awal: 2300000 },
  { date: "2024-06-02", harga_akhir: 9400000, harga_awal: 5700000 },
  { date: "2024-06-03", harga_akhir: 2200000, harga_awal: 1400000 },
  { date: "2024-06-04", harga_akhir: 8800000, harga_awal: 5200000 },
  { date: "2024-06-05", harga_akhir: 1900000, harga_awal: 1200000 },
  { date: "2024-06-06", harga_akhir: 6100000, harga_awal: 3700000 },
  { date: "2024-06-07", harga_akhir: 6500000, harga_awal: 4100000 },
  { date: "2024-06-08", harga_akhir: 7700000, harga_awal: 4700000 },
  { date: "2024-06-09", harga_akhir: 8700000, harga_awal: 5600000 },
  { date: "2024-06-10", harga_akhir: 3200000, harga_awal: 2100000 },
  { date: "2024-06-11", harga_akhir: 1900000, harga_awal: 1200000 },
  { date: "2024-06-12", harga_akhir: 9800000, harga_awal: 5900000 },
  { date: "2024-06-13", harga_akhir: 1700000, harga_awal: 1100000 },
  { date: "2024-06-14", harga_akhir: 8500000, harga_awal: 5200000 },
  { date: "2024-06-15", harga_akhir: 6200000, harga_awal: 3900000 },
  { date: "2024-06-16", harga_akhir: 7400000, harga_awal: 4500000 },
  { date: "2024-06-17", harga_akhir: 9500000, harga_awal: 5800000 },
  { date: "2024-06-18", harga_akhir: 2300000, harga_awal: 1500000 },
  { date: "2024-06-19", harga_akhir: 7100000, harga_awal: 4300000 },
  { date: "2024-06-20", harga_akhir: 8200000, harga_awal: 5100000 },
  { date: "2024-06-21", harga_akhir: 3500000, harga_awal: 2200000 },
  { date: "2024-06-22", harga_akhir: 6500000, harga_awal: 4000000 },
  { date: "2024-06-23", harga_akhir: 9600000, harga_awal: 5900000 },
  { date: "2024-06-24", harga_akhir: 2800000, harga_awal: 1700000 },
  { date: "2024-06-25", harga_akhir: 3000000, harga_awal: 1900000 },
  { date: "2024-06-26", harga_akhir: 8700000, harga_awal: 5300000 },
  { date: "2024-06-27", harga_akhir: 8900000, harga_awal: 5500000 },
  { date: "2024-06-28", harga_akhir: 3100000, harga_awal: 1900000 },
  { date: "2024-06-29", harga_akhir: 2200000, harga_awal: 1400000 },
  { date: "2024-06-30", harga_akhir: 8900000, harga_awal: 5400000 },
]

const chartConfig = {
  visitors: {
    label: "Total Valuasi",
  },
  harga_akhir: {
    label: "Terjual",
    color: "hsl(var(--chart-1))",
  },
  harga_awal: {
    label: "Harga Awal",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Statistik Penjualan Lelang</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Total valuasi harga awal vs harga akhir (terjual)
          </span>
          <span className="@[540px]/card:hidden">Valuasi 3 bulan terakhir</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              3 Bulan
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              30 Hari
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              7 Hari
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="3 Bulan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 Bulan
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 Hari
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 Hari
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillHargaAkhir" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-harga_akhir)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-harga_akhir)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillHargaAwal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-harga_awal)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-harga_awal)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            {/* Added YAxis for better scale visualization */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                return value
              }}
              width={60}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="harga_awal"
              type="natural"
              fill="url(#fillHargaAwal)"
              stroke="var(--color-harga_awal)"
              stackId="a"
              name="Harga Awal"
            />
            <Area
              dataKey="harga_akhir"
              type="natural"
              fill="url(#fillHargaAkhir)"
              stroke="var(--color-harga_akhir)"
              stackId="a"
              name="Harga Terjual"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
