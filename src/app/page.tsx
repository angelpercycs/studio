import { AdBanner } from '@/components/ad-banner';
import { DailyMatches } from '@/components/daily-matches';
import { MatchesByDate } from '@/components/matches-by-date';
import { MatchesByLeague } from '@/components/matches-by-league';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarDays, Shield } from 'lucide-react';
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
          <h1 className="text-xl font-bold tracking-tight">
            Fútbol Stats Zone
          </h1>
        </header>

        <div className="mb-4 flex w-full justify-center">
          <div className="w-full max-w-4xl">
            <AdBanner />
          </div>
        </div>
        
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
        </Tabs>
      </main>
      <footer className="w-full py-4 px-4 md:px-0 text-center text-sm text-muted-foreground">
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
      </footer>
    </div>
  );
}
