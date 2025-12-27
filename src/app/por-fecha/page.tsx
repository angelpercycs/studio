import { MatchesByDate } from "@/components/matches-by-date";

export const revalidate = 1800; // Revalidate every 30 minutes

export default function PorFechaPage() {
  return <MatchesByDate />;
}
