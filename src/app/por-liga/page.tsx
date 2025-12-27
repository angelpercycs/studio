import { MatchesByLeague } from "@/components/matches-by-league";

export const revalidate = 1800; // Revalidate every 30 minutes

export default function PorLigaPage() {
    return <MatchesByLeague />;
}
