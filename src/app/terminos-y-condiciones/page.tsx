import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TerminosYCondicionesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Términos y Condiciones de Uso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm md:text-base">
        <p>Al acceder a este sitio web, usted acepta cumplir con estos términos:</p>
        
        <div>
            <h3 className="font-semibold mb-2">1. Contenido Informativo</h3>
            <p>Todo el contenido, incluidos pronósticos, estadísticas y probabilidades, se ofrece exclusivamente con fines de entretenimiento e información. No garantizamos la exactitud de los resultados deportivos.</p>
        </div>
        
        <div>
            <h3 className="font-semibold mb-2">2. Responsabilidad</h3>
            <p>Fútbol Stats Zone no se hace responsable de las pérdidas económicas derivadas del uso de nuestra información para apuestas reales. El usuario apuesta bajo su propio riesgo.</p>
        </div>

        <div>
            <h3 className="font-semibold mb-2">3. Juego Responsable</h3>
            <p>El acceso está prohibido a menores de 18 años. Recordamos que en Perú, el juego excesivo puede causar ludopatía.</p>
        </div>

        <div>
            <h3 className="font-semibold mb-2">4. Propiedad Intelectual</h3>
            <p>Los nombres de equipos y ligas son propiedad de sus respectivos dueños y se usan bajo fines descriptivos.</p>
        </div>
      </CardContent>
    </Card>
  );
}
