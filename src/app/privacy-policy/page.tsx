import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Política de Privacidad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm md:text-base">
        <p>En Fútbol Stats Zone, accesible desde fszscore.com, una de nuestras principales prioridades es la privacidad de nuestros visitantes.</p>
        
        <div>
            <h3 className="font-semibold mb-2">1. Información que recopilamos</h3>
            <p>No solicitamos datos personales para navegar. Sin embargo, utilizamos herramientas de terceros como Google Analytics para entender cómo los usuarios usan la web y servicios de publicidad para mostrar anuncios. Estas herramientas pueden recopilar datos como su dirección IP, tipo de navegador y tiempo de permanencia.</p>
        </div>
        
        <div>
            <h3 className="font-semibold mb-2">2. Cookies</h3>
            <p>Utilizamos cookies para mejorar la experiencia del usuario y para fines publicitarios. Usted puede elegir desactivar las cookies a través de las opciones de su navegador.</p>
        </div>

        <div>
            <h3 className="font-semibold mb-2">3. Publicidad de Terceros</h3>
            <p>Los proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores de un usuario a este sitio web o a otros sitios web. También podemos utilizar otras redes publicitarias de terceros, como Adsterra.</p>
        </div>

        <div>
            <h3 className="font-semibold mb-2">4. Enlaces a terceros</h3>
            <p>Este sitio contiene enlaces a sitios de apuestas (Betsson, Inkabet). No somos responsables de las prácticas de privacidad de dichos sitios.</p>
        </div>
      </CardContent>
    </Card>
  );
}
