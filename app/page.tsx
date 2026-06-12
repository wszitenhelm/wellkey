import { cookies } from "next/headers";
import { LandingPageView } from "@/components/marketing/landing-page-view";
import { privacyCards } from "@/lib/content/privacy";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSeenIntro = cookieStore.get("wellkey_landing_seen")?.value === "1";

  return <LandingPageView privacyCards={privacyCards} hasSeenIntro={hasSeenIntro} />;
}
