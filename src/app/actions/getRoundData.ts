'use server';
import { supabase } from '@/lib/supabase';

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
            season,
            countries (
                id,
                name,
                flag
            )
        `);

    if (error) {
        console.error('Error fetching leagues with countries:', error);
        return {};
    }

    leaguesCache = allLeagues;
    const leagueMap = allLeagues.reduce((acc: { [key: string]: any }, league: any) => {
        acc[league.id] = league;
        return acc;
    }, {});
    
    leaguesMapCache = leagueMap;
    return leagueMap;
}

async function getTeamStandings(teamId: string, season: string, league_id: string, matchDate: string) {
    if (!teamId || !season || !league_id) return null;
    const { data: allMatches, error: matchesError } = await supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score, season')
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

    const seasonMatches = allMatches.filter(m => m.season === season);

    for (const match of seasonMatches) {
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

async function getLastNMatchesStandings(teamId: string, season: string, league_id: string, isHome: boolean, matchDate: string, limit = 3) {
    const defaultStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
     if (!teamId || !season || !league_id) return { all: defaultStats, homeAway: defaultStats };
    
    let query = supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score, season')
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
             if (match.season !== season) continue;
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
        .select('team1_id, team2_id, team1_score, team2_score, season')
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

async function getFavoritesForMatches(matchIds: string[]): Promise<Record<string, string>> {
    if (matchIds.length === 0) {
        return {};
    }

    const { data, error } = await supabase
        .from('5_analisis_favorito')
        .select('match_id, team_id')
        .in('match_id', matchIds)
        .eq('ranking', 1);

    if (error) {
        console.error('Error fetching favorites:', error);
        return {};
    }

    const favoritesMap: Record<string, string> = {};
    for (const fav of data) {
        favoritesMap[fav.match_id] = fav.team_id;
    }

    return favoritesMap;
}

export async function getCountries() {
    try {
        const { data, error } = await supabase
            .from('countries')
            .select('id, name, flag')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching countries:', error);
            return { data: null, error: `Error de Supabase: ${error.message}` };
        }
        return { data, error: null };
    } catch (e: any) {
        console.error('Unexpected error in getCountries:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function getSeasonsByCountry(countryId: string) {
    try {
        if (!countryId) return { data: [], error: null };
        const { data, error } = await supabase
            .from('leagues')
            .select('season')
            .eq('country_id', countryId)
            .order('season', { ascending: false });

        if (error) {
            console.error('Error fetching seasons:', error);
            return { data: null, error: `Error de Supabase: ${error.message}` };
        }
        const uniqueSeasons = [...new Set(data.map(l => l.season))];
        return { data: uniqueSeasons, error: null };
    } catch (e: any) {
        console.error('Unexpected error in getSeasonsByCountry:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function getLeaguesByCountryAndSeason(countryId: string, season: string) {
    try {
        if (!countryId || !season) return { data: [], error: null };

        const { data, error } = await supabase
            .from('leagues')
            .select('id, name')
            .eq('country_id', countryId)
            .eq('season', season)
            .order('name', { ascending: true });
        
        if (error) {
            console.error('Error fetching leagues:', error);
            return { data: null, error: `Error de Supabase: ${error.message}` };
        }

        return { data, error: null };
    } catch (e: any) {
        console.error('Unexpected error in getLeaguesByCountry:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function getRoundsForLeague(leagueId: string, season: string) {
    try {
        if (!leagueId || !season) return { data: [], error: null };

        const { data, error } = await supabase
            .from('matches')
            .select('matchday')
            .eq('league_id', leagueId)
            .eq('season', season)
            .order('matchday', { ascending: true });

        if (error) {
            console.error('Error fetching rounds:', error);
            return { data: null, error: `Error de Supabase: ${error.message}` };
        }

        const uniqueRounds = [...new Set(data.map(match => match.matchday).filter(Boolean))].sort((a,b) => {
            const numA = parseInt(a.toString().replace( /^\D+/g, ''));
            const numB = parseInt(b.toString().replace( /^\D+/g, ''));
            return numA - numB;
        });

        return { data: uniqueRounds, error: null };
    } catch (e: any) {
        console.error('Unexpected error in getRoundsForLeague:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function getMatchesByRound(leagueId: string, season: string, round: string) {
    try {
        if (!leagueId || !season || !round) return { data: [], error: null };

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
            .eq('league_id', leagueId)
            .eq('season', season)
            .eq('matchday', round)
            .order('match_date', { ascending: true });

        if (matchesError) {
            console.error('Error fetching matches by round:', matchesError);
            return { data: null, error: `Error de Supabase: ${matchesError.message}` };
        }

        if (!matchesData || matchesData.length === 0) {
            return { data: [], error: null };
        }
        
        const leaguesMap = await getLeagues();
        const matchIds = matchesData.map(m => m.id);
        const favoritesMap = await getFavoritesForMatches(matchIds);
        
        const matchesWithLeagues = matchesData.map(match => {
            let favorite = null;
            const favoriteTeamId = favoritesMap[match.id];
            if (favoriteTeamId) {
                if (favoriteTeamId === match.team1_id) {
                    favorite = 'team1';
                } else if (favoriteTeamId === match.team2_id) {
                    favorite = 'team2';
                }
            }
            return {
                ...match,
                league: leaguesMap[match.league_id] || { name: match.league_id, countries: { name: 'Unknown', flag: null } },
                favorite
            };
        });

        const statsPromises = matchesWithLeagues.map(async match => {
            if (!match.team1_id || !match.team2_id || !match.season || !match.league_id) {
                return { ...match };
            }
            try {
                const [team1Standings, team2Standings, team1Last3Data, team2Last3Data] = await Promise.all([
                    getTeamStandings(match.team1_id, match.season, match.league_id, match.match_date),
                    getTeamStandings(match.team2_id, match.season, match.league_id, match.match_date),
                    getLastNMatchesStandings(match.team1_id, match.season, match.league_id, true, match.match_date),
                    getLastNMatchesStandings(match.team2_id, match.season, match.league_id, false, match.match_date)
                ]);

                return {
                    ...match,
                    team1_standings: team1Standings,
                    team2_standings: team2Standings,
                    team1_last_3: team1Last3Data?.all,
                    team2_last_3: team2Last3Data?.all,
                    team1_last_3_home_away: team1Last3Data?.homeAway,
                    team2_last_3_home_away: team2Last3Data?.homeAway,
                };
            } catch (error) {
                console.error('Error processing stats for match', match.id, error);
                return { ...match, favorite: null };
            }
        });

        const enrichedMatches = await Promise.all(statsPromises);
        
        return { data: enrichedMatches, error: null };
    } catch (e: any) {
        console.error('Unexpected error in getMatchesByRound:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}

function checkIsFavoriteTeam(standings: any): boolean {
    if (!standings || standings.played < 8) return false;
    const winRate = (standings.won / standings.played) * 100;
    const lossRate = (standings.lost / standings.played) * 100;
    return winRate > 45 && lossRate < 33;
}

export async function getTeamsByLeague(leagueId: string, season: string) {
    try {
        if (!leagueId || !season) return { data: [], error: null };

        const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select(`
                team1_id,
                team2_id,
                team1:teams!matches_team1_id_fkey(id, name),
                team2:teams!matches_team2_id_fkey(id, name)
            `)
            .eq('league_id', leagueId)
            .eq('season', season)
            .filter('team1_score', 'not.is', null)
            .filter('team2_score', 'not.is', null);

        if (matchesError) {
            console.error('Error fetching matches for league team list:', matchesError);
            return { data: null, error: `Error de Supabase: ${matchesError.message}` };
        }
        
        if (!matches) return { data: [], error: null };
        
        const teamsMap = new Map<string, { id: string, name: string }>();
        matches.forEach(match => {
            if (match.team1 && !teamsMap.has(match.team1.id)) teamsMap.set(match.team1.id, { id: match.team1.id, name: match.team1.name });
            if (match.team2 && !teamsMap.has(match.team2.id)) teamsMap.set(match.team2.id, { id: match.team2.id, name: match.team2.name });
        });

        const teamsData = Array.from(teamsMap.values());

        const standingsPromises = teamsData.map(team => 
            getTeamStandings(team.id, season, leagueId, new Date().toISOString())
        );
        const standingsResults = await Promise.all(standingsPromises);

        const favoriteTeams = teamsData
            .map((team, index) => ({ team, standings: standingsResults[index] }))
            .filter(({ standings }) => checkIsFavoriteTeam(standings))
            .map(({ team }) => ({ id: team.id, name: team.name }));

        return { data: favoriteTeams, error: null };
    } catch (e: any) {
        console.error('Unexpected error in getTeamsByLeague:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function getTeamMatches(teamId: string, leagueId: string, season: string) {
     try {
        if (!teamId || !leagueId || !season) return { data: [], error: null };

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
            .eq('league_id', leagueId)
            .eq('season', season)
            .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
            .order('match_date', { ascending: false });

        if (matchesError) {
            console.error('Error fetching matches by team:', matchesError);
            return { data: null, error: `Error de Supabase: ${matchesError.message}` };
        }
        
        if (!matchesData || matchesData.length === 0) {
            return { data: [], error: null };
        }
        
        const leaguesMap = await getLeagues();
        const matchIds = matchesData.map(m => m.id);
        const favoritesMap = await getFavoritesForMatches(matchIds);
        
        const matchesWithLeagues = matchesData.map(match => {
            let favorite = null;
            const favoriteTeamId = favoritesMap[match.id];
            if (favoriteTeamId) {
                if (favoriteTeamId === match.team1_id) {
                    favorite = 'team1';
                } else if (favoriteTeamId === match.team2_id) {
                    favorite = 'team2';
                }
            }
            return {
                ...match,
                league: leaguesMap[match.league_id] || { name: match.league_id, countries: { name: 'Unknown', flag: null } },
                favorite
            };
        });
        
        const statsPromises = matchesWithLeagues.map(async match => {
            if (!match.team1_id || !match.team2_id || !match.season || !match.league_id) {
                return { ...match };
            }
             try {
                const [team1Standings, team2Standings, team1Last3Data, team2Last3Data] = await Promise.all([
                    getTeamStandings(match.team1_id, match.season, match.league_id, match.match_date),
                    getTeamStandings(match.team2_id, match.season, match.league_id, match.match_date),
                    getLastNMatchesStandings(match.team1_id, match.season, match.league_id, true, match.match_date),
                    getLastNMatchesStandings(match.team2_id, match.season, match.league_id, false, match.match_date)
                ]);

                return {
                    ...match,
                    team1_standings: team1Standings,
                    team2_standings: team2Standings,
                    team1_last_3: team1Last3Data?.all,
                    team2_last_3: team2Last3Data?.all,
                    team1_last_3_home_away: team1Last3Data?.homeAway,
                    team2_last_3_home_away: team2Last3Data?.homeAway,
                };
            } catch (error) {
                console.error('Error processing stats for match', match.id, error);
                return { ...match, favorite: null };
            }
        });
        
        const enrichedMatches = await Promise.all(statsPromises);
        
        const playedMatches = enrichedMatches.filter(m => m.team1_score !== null && m.team2_score !== null);
        const upcomingMatches = enrichedMatches.filter(m => m.team1_score === null && m.team2_score === null);
        const nextMatch = upcomingMatches.length > 0 ? [upcomingMatches[upcomingMatches.length - 1]] : [];
        const filteredPlayedMatches = playedMatches.filter(m => {
            if (!m.matchday) return false;
            const matchdayNumber = parseInt(m.matchday.toString().replace( /^\D+/g, ''));
            return matchdayNumber >= 9;
        });

        return { data: [...nextMatch, ...filteredPlayedMatches], error: null };

    } catch (e: any) {
        console.error('Unexpected error in getTeamMatches:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}
