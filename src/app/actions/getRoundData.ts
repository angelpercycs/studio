'use server';

import { supabase } from '@/lib/supabase';

export async function getCountries() {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Error de Supabase: ${error.message}`);
    }
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e.message };
  }
}

export async function getLeaguesByCountry(countryId: string) {
  try {
    if (!countryId) return { data: [], error: null };

    const { data, error } = await supabase
      .from('leagues')
      .select('id, name, league_id, season')
      .eq('country_id', countryId)
      .order('name', { ascending: true });
      
    if (error) {
      throw new Error(`Error de Supabase: ${error.message}`);
    }
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e.message };
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
        throw new Error(`Error de Supabase: ${error.message}`);
    }

    const uniqueRounds = [...new Set(data.map(match => match.matchday))];
    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    uniqueRounds.sort(collator.compare);

    return { data: uniqueRounds, error: null };
  } catch (e: any) {
    return { data: null, error: e.message };
  }
}

export async function getMatchesByRound(leagueId: string, season: string, round: string) {
    try {
        if (!leagueId || !season || !round) return { data: [], error: null };

        const { data, error } = await supabase
            .from('matches')
            .select('id, match_date, team1_id, team2_id, league_id, season, team1_score, team2_score, matchday, match_date as match_date_iso')
            .eq('league_id', leagueId)
            .eq('season', season)
            .eq('matchday', round)
            .order('match_date', { ascending: true });

        if (error) {
            throw new Error(`Error de Supabase: ${error.message}`);
        }

        return { data, error: null };
    } catch (e: any) {
        return { data: null, error: e.message };
    }
}