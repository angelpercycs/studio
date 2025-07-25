
import {z} from 'genkit';

const StandingsSchema = z.object({
  played: z.number().describe('Partidos jugados'),
  won: z.number().describe('Partidos ganados'),
  drawn: z.number().describe('Partidos empatados'),
  lost: z.number().describe('Partidos perdidos'),
  goalsFor: z.number().describe('Goles a favor'),
  goalsAgainst: z.number().describe('Goles en contra'),
  points: z.number().describe('Puntos'),
});

export const MatchPredictionInputSchema = z.object({
  team1Name: z.string().describe('Nombre del equipo local'),
  team2Name: z.string().describe('Nombre del equipo visitante'),
  team1_standings: StandingsSchema.describe('Clasificación general del equipo local'),
  team2_standings: StandingsSchema.describe('Clasificación general del equipo visitante'),
  team1_last_3: StandingsSchema.describe('Rendimiento del equipo local en los últimos 3 partidos (general)'),
  team2_last_3: StandingsSchema.describe('Rendimiento del equipo visitante en los últimos 3 partidos (general)'),
  team1_last_3_home_away: StandingsSchema.describe('Rendimiento del equipo local en los últimos 3 partidos en casa'),
  team2_last_3_home_away: StandingsSchema.describe('Rendimiento del equipo visitante en los últimos 3 partidos como visitante'),
});

export const MatchPredictionOutputSchema = z.object({
    has_prediction: z.boolean().describe('Indica si se pudo generar un pronóstico.'),
    winner_name: z.string().optional().describe('Nombre del equipo que se predice como ganador.'),
    prediction_text: z.string().optional().describe('Texto explicativo del pronóstico.'),
});

export type MatchPredictionInput = z.infer<typeof MatchPredictionInputSchema>;
export type MatchPredictionOutput = z.infer<typeof MatchPredictionOutputSchema>;
