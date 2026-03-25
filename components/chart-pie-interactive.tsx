"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

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

const chartConfig = {
  total: {
    label: "Total Lelang",
  },
  ditutup: {
    label: "Selesai / Ditutup",
    color: "hsl(var(--chart-1))",
  },
  dibuka: {
    label: "Aktif / Dibuka",
    color: "hsl(var(--chart-2))",
  },
  pending: {
    label: "Belum Aktif / Pending",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

interface ChartPieProps {
  aktif: number;
  belumAktif: number;
  ditutup: number;
}

export function ChartPieInteractive({ aktif, belumAktif, ditutup }: ChartPieProps) {
  const chartData = React.useMemo(() => [
    { status: "ditutup", total: ditutup, fill: "var(--color-ditutup)" },
    { status: "dibuka", total: aktif, fill: "var(--color-dibuka)" },
    { status: "pending", total: belumAktif, fill: "var(--color-pending)" },
  ], [aktif, belumAktif, ditutup])

  const totalLelang = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.total, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col h-full border shadow-xs">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status Lelang</CardTitle>
        <CardDescription>Semua Waktu</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalLelang.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Lelang
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
