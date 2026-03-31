import { SectionCardsSkeleton } from "@/components/section-cards"
import { ChartAreaInteractiveSkeleton } from "@/components/chart-area-interactive"
import { SiteHeader } from "@/components/site-header"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="Dashboard" />
      <div className="flex-1 flex flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCardsSkeleton />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractiveSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
