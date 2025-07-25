'use server';
import { supabase } from '@/lib/supabase';
import { getMatchPrediction } from '@/ai/flows/get-match-prediction-flow';
import type { MatchPredictionOutput } from '@/ai/schemas/match-prediction-schemas';

let leaguesCache: any[] | null = null;
let leaguesMapCache: { [key: string]: any } | null = null;

async function getLeagues() {
    if (leaguesMapCache) {
        return leaguesMapCache;
    }

    const { data: allLeagues, error } = await supabase
        .from('leagues')
        .select(`
            id,
            name,
            country_id,
            countries (
                id,
                name
            )
        `);

    if (error) {
        console.error('Error fetching leagues with countries:', error);
        return {};
    }

    leaguesCache = allLeagues;
    const leagueMap = allLeagues.reduce((acc: any, league: any) => {
        acc[league.id] = league;
        return acc;
    }, {});
    
    leaguesMapCache = leagueMap;
    return leagueMap;
}

async function getTeamStandings(teamId: number, season: number, league_id: number, matchDate: string) {
    if (!teamId || !season || !league_id) return null;
    const { data: allMatches, error: matchesError } = await supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score')
        .eq('season', season)
        .eq('league_id', league_id)
        .lt('match_date', matchDate)
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .filter('team1_score', 'not.is', null)
        .filter('team2_score', 'not.is', null);

    if (matchesError) {
        console.error(`Error fetching matches for team ${teamId}:`, matchesError);
        return null;
    }

    const stats = {
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
        home: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
        away: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    };

    if (!allMatches) return stats;

    for (const match of allMatches) {
        const isHome = match.team1_id === teamId;
        const teamScore = isHome ? match.team1_score : match.team2_score;
        const opponentScore = isHome ? match.team2_score : match.team1_score;

        if (teamScore === null || opponentScore === null) continue;

        const venueStats = isHome ? stats.home : stats.away;
        venueStats.played++;
        venueStats.goalsFor += teamScore;
        venueStats.goalsAgainst += opponentScore;

        if (teamScore > opponentScore) {
            venueStats.won++;
            venueStats.points += 3;
        } else if (teamScore === opponentScore) {
            venueStats.drawn++;
            venueStats.points += 1;
        } else {
            venueStats.lost++;
        }
    }
    
    stats.played = stats.home.played + stats.away.played;
    stats.won = stats.home.won + stats.away.won;
    stats.drawn = stats.home.drawn + stats.away.drawn;
    stats.lost = stats.home.lost + stats.away.lost;
    stats.goalsFor = stats.home.goalsFor + stats.away.goalsFor;
    stats.goalsAgainst = stats.home.goalsAgainst + stats.away.goalsAgainst;
    stats.points = stats.home.points + stats.away.points;

    return stats;
}

async function getLastNMatchesStandings(teamId: number, season: number, league_id: number, isHome: boolean, matchDate: string, limit = 3) {
    const defaultStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
     if (!teamId || !season || !league_id) return { all: defaultStats, homeAway: defaultStats };
    
    let query = supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score')
        .eq('season', season)
        .eq('league_id', league_id)
        .lt('match_date', matchDate)
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .filter('team1_score', 'not.is', null)
        .filter('team2_score', 'not.is', null)
        .order('match_date', { ascending: false })
        .limit(limit);

    const { data: lastMatches, error: matchesError } = await query;
    
    if (matchesError) {
        console.error(`Error fetching last ${limit} matches for team ${teamId}:`, matchesError);
        return { all: defaultStats, homeAway: defaultStats };
    }

    const calculateStats = (matches: any[], forHome: boolean | null) => {
        const stats = { ...defaultStats };
        if (!matches) return stats;
        for (const match of matches) {
            const teamIsHomeInMatch = match.team1_id === teamId;
            if (forHome !== null && forHome !== teamIsHomeInMatch) {
                continue;
            }
             if (match.team1_score === null || match.team2_score === null) continue;
            stats.played++;
            const teamScore = teamIsHomeInMatch ? match.team1_score : match.team2_score;
            const opponentScore = teamIsHomeInMatch ? match.team2_score : match.team1_score;

            stats.goalsFor += teamScore;
            stats.goalsAgainst += opponentScore;

            if (teamScore > opponentScore) {
                stats.won++; stats.points += 3;
            } else if (teamScore === opponentScore) {
                stats.drawn++; stats.points += 1;
            } else {
                stats.lost++;
            }
        }
        return stats;
    };
    
    const allStats = calculateStats(lastMatches, null);
    
    let homeAwayQuery = supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score')
        .eq('season', season)
        .eq('league_id', league_id)
        .lt('match_date', matchDate)
        .filter('team1_score', 'not.is', null)
        .filter('team2_score', 'not.is', null)
        .order('match_date', { ascending: false });


    if (isHome) {
        homeAwayQuery = homeAwayQuery.eq('team1_id', teamId).limit(limit);
    } else {
        homeAwayQuery = homeAwayQuery.eq('team2_id', teamId).limit(limit);
    }
    
    const { data: lastHomeAwayMatches, error: homeAwayError } = await homeAwayQuery;

    if(homeAwayError){
         console.error(`Error fetching last ${limit} home/away matches for team ${teamId}:`, homeAwayError);
    }

    const homeAwayStats = calculateStats(lastHomeAwayMatches, isHome);
    
    return { all: allStats, homeAway: homeAwayStats };
}


export async function getMatchesByDate(startDate: string, endDate: string) {
    try {
        const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`
                id,
                match_date,
                match_date_iso:match_date,
                team1_id,
                team2_id,
                league_id,
                season,
                team1_score,
                team2_score,
                matchday,
                team1:teams!matches_team1_id_fkey(id, name),
                team2:teams!matches_team2_id_fkey(id, name)
            `)
            .gte('match_date', startDate)
            .lte('match_date', endDate)
            .order('match_date', { ascending: true });

        if (matchesError) {
            console.error('Error fetching matches:', matchesError);
            return { data: null, error: `Error de Supabase: ${matchesError.message}` };
        }

        if (!matchesData || matchesData.length === 0) {
            return { data: [], error: null };
        }
        
        const leaguesMap = await getLeagues();

        const matchesWithLeagues = matchesData.map(match => ({
            ...match,
            league: leaguesMap[match.league_id] || { name: match.league_id, countries: { name: 'Unknown' } }
        }));


        const statsPromises = matchesWithLeagues.map(async (match) => {
            if (!match.team1_id || !match.team2_id || !match.season || !match.league_id) {
                return { ...match, prediction: { has_prediction: false } };
            }

            try {
                const [team1Standings, team2Standings, team1Last3Data, team2Last3Data] = await Promise.all([
                    getTeamStandings(match.team1_id, match.season, match.league_id, match.match_date),
                    getTeamStandings(match.team2_id, match.season, match.league_id, match.match_date),
                    getLastNMatchesStandings(match.team1_id, match.season, match.league_id, true, match.match_date),
                    getLastNMatchesStandings(match.team2_id, match.season, match.league_id, false, match.match_date)
                ]);

                let prediction: MatchPredictionOutput = { has_prediction: false };
                const allDataAvailable = 
                    match.team1 && 
                    match.team2 && 
                    team1Standings && 
                    team2Standings && 
                    team1Last3Data?.all && 
                    team2Last3Data?.all && 
                    team1Last3Data?.homeAway && 
                    team2Last3Data?.homeAway;

                if (allDataAvailable) {
                    try {
                        prediction = await getMatchPrediction({
                            team1Name: match.team1.name,
                            team2Name: match.team2.name,
                            team1_standings: team1Standings,
                            team2_standings: team2Standings,
                            team1_last_3: team1Last3Data.all,
                            team2_last_3: team2Last3Data.all,
                            team1_last_3_home_away: team1Last3Data.homeAway,
                            team2_last_3_home_away: team2Last3Data.homeAway,
                        });
                    } catch(e) {
                        console.error('Error getting match prediction', e);
                        // Keep prediction as has_prediction: false
                    }
                }

                return {
                    ...match,
                    team1_standings: team1Standings,
                    team2_standings: team2Standings,
                    team1_last_3: team1Last3Data?.all,
                    team2_last_3: team2Last3Data?.all,
                    team1_last_3_home_away: team1Last3Data?.homeAway,
                    team2_last_3_home_away: team2Last3Data?.homeAway,
                    prediction
                };
            } catch (error) {
                console.error('Error processing stats for match', match.id, error);
                return { ...match, prediction: { has_prediction: false } };
            }
        });

        const enrichedMatches = await Promise.all(statsPromises);
        
        return { data: enrichedMatches, error: null };
    } catch (e: any) {
        console.error('Unexpected error in getMatchesByDate:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}
