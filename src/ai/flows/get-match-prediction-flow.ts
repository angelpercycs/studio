'use server';
/**
 * @fileOverview Flujo de Genkit para predecir el resultado de un partido de fútbol.
 *
 * - getMatchPrediction - Función principal que ejecuta el flujo de predicción.
 * - MatchPredictionInput - El tipo de entrada para la función.
 * - MatchPredictionOutput - El tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {
  MatchPredictionInputSchema,
  MatchPredictionOutputSchema,
  type MatchPredictionInput,
  type MatchPredictionOutput,
} from '@/ai/schemas/match-prediction-schemas';

const prompt = ai.definePrompt({
  name: 'matchPredictionPrompt',
  input: {schema: MatchPredictionInputSchema},
  output: {schema: MatchPredictionOutputSchema},
  prompt: `Eres un experto analista de fútbol. Tu tarea es predecir el ganador de un partido basándote en las estadísticas proporcionadas.

Analiza los siguientes datos para el partido entre {{team1Name}} (Local) y {{team2Name}} (Visitante):

**Clasificación General:**
- {{team1Name}}: {{json team1_standings}}
- {{team2Name}}: {{json team2_standings}}

**Rendimiento en los últimos 3 partidos (General):**
- {{team1Name}}: {{json team1_last_3}}
- {{team2Name}}: {{json team2_last_3}}

**Rendimiento en los últimos 3 partidos (Local/Visitante):**
- {{team1Name}} (Local): {{json team1_last_3_home_away}}
- {{team2Name}} (Visitante): {{json team2_last_3_home_away}}

**Instrucciones:**
1.  Compara la forma actual de ambos equipos, tanto general como en sus respectivos roles de local/visitante.
2.  Considera la posición en la tabla y la diferencia de puntos.
3.  Analiza la capacidad ofensiva (goles a favor) y defensiva (goles en contra).
4.  Basado en tu análisis, determina qué equipo tiene más probabilidades de ganar.
5.  Responde en el formato JSON especificado.
    -   \`has_prediction\` debe ser \`true\`.
    -   \`winner_name\` debe ser el nombre del equipo que crees que ganará.
    -   \`prediction_text\` debe ser una breve explicación (máximo 25 palabras) de por qué crees que ese equipo ganará, mencionando al ganador por su nombre. Por ejemplo: "Basado en su sólida defensa y su racha de victorias en casa, se predice una victoria para el Real Madrid."
`,
});

const getMatchPredictionFlow = ai.defineFlow(
  {
    name: 'getMatchPredictionFlow',
    inputSchema: MatchPredictionInputSchema,
    outputSchema: MatchPredictionOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        return { has_prediction: false };
      }
      return output;
    } catch (error) {
      console.error('Error en el flujo de predicción:', error);
      return { has_prediction: false };
    }
  }
);

export async function getMatchPrediction(input: MatchPredictionInput): Promise<MatchPredictionOutput> {
  return getMatchPredictionFlow(input);
}
