import { AdBanner } from '@/components/ad-banner';
import { DailyMatches } from '@/components/daily-matches';
import { MatchesByDate } from '@/components/matches-by-date';
import { MatchesByLeague } from '@/components/matches-by-league';
import { MatchesByFavorite } from '@/components/matches-by-favorite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarDays, Shield, Star } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="container mx-auto flex-grow px-4 py-8 md:py-12">
        <header className="mb-8 flex items-center gap-4">
          <Image
            src="/icon.svg"
            alt="App Icon"
            width={48}
            height={48}
            className="baby-blue-icon"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Fútbol Stats Zone
            </h1>
            <p className="text-sm text-muted-foreground">Pronósticos de Fútbol</p>
          </div>
        </header>

        <div className="mb-4 flex w-full justify-center">
          <div className="w-full max-w-4xl">
            <AdBanner />
          </div>
        </div>
        
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">
              <CalendarDays className="mr-2 h-4 w-4 text-primary" />
              Encuentros del día
            </TabsTrigger>
            <TabsTrigger value="by-date">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Por fecha
            </TabsTrigger>
            <TabsTrigger value="by-league">
              <Shield className="mr-2 h-4 w-4 text-primary" />
              Por liga
            </TabsTrigger>
            <TabsTrigger value="by-favorite">
              <Star className="mr-2 h-4 w-4 text-primary" />
              Favorito
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <DailyMatches />
          </TabsContent>
          <TabsContent value="by-date">
            <MatchesByDate />
          </TabsContent>
          <TabsContent value="by-league">
            <MatchesByLeague />
          </TabsContent>
           <TabsContent value="by-favorite">
            <MatchesByFavorite />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="w-full py-4 px-4 md:px-0 text-center text-xs text-muted-foreground space-y-4">
        <div>
            <p className="mb-2">© 2025 Fútbol Stats Zone. Todos los derechos reservados.</p>
            <p className="mb-2">
            Fútbol Stats Zone es un sitio independiente y no está afiliado, patrocinado ni autorizado por ninguna liga, federación, club o entidad oficial mencionada en este sitio.
            </p>
            <p className="mb-2">
            Todos los nombres de equipos, competiciones y marcas comerciales que puedan aparecer son propiedad de sus respectivos titulares y se utilizan únicamente con fines descriptivos e informativos.
            </p>
            <p>
            La información publicada en este sitio, incluyendo resultados y pronósticos, se ofrece únicamente con fines de entretenimiento y no constituye consejo de apuestas ni relación contractual alguna.
            </p>
        </div>
        <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold mb-2 text-sm">Información Regulatoria (Perú)</h3>
            <div className="space-y-2">
                <p>
                    <span className="font-semibold">BETSSON:</span> 18+ | SFTG Limited | RUC: 20612423371 | DOMICILIO FISCAL: MANUEL A. OLAECHEA 1470, OFICINA 201, DISTRITO DE MIRAFLORES, PROVINCIA Y DEPARTAMENTO DE LIMA | MINCETUR License #: 11002586010000 & 21002586010000.
                </p>
                <p>
                    <span className="font-semibold">INKABET:</span> 18+ | Lucky Torito S.A.C. | MINCETUR License #: 11002603010000 & 21002603010000.
                </p>
                <p className="italic">
                    "El juego y las apuestas deportivas a distancia realizados en exceso pueden causar ludopatía".
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
