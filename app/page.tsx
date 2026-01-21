import { LandingNavbar } from "@/components/landing-navbar";
import { HowItWorks } from "@/components/how-it-works";
import { LandingFooter } from "@/components/landing-footer";
import { AuctionHero } from "@/components/auction-hero";
import { FeaturedAuctions } from "@/components/featured-auctions";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <div className="flex-1">
        <AuctionHero />
        <FeaturedAuctions />
        <HowItWorks />
      </div>
      <LandingFooter />
    </main>
  );
}
