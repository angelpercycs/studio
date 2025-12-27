import { MatchesByFavorite } from "@/components/matches-by-favorite";

export const revalidate = 1800; // Revalidate every 30 minutes

export default function PorFavoritoPage() {
    return <MatchesByFavorite />;
}
