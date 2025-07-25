import { DailyMatches } from '@/components/daily-matches';
import { MatchesByDate } from '@/components/matches-by-date';
import { MatchesByLeague } from '@/components/matches-by-league';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="container mx-auto flex-grow px-4 py-8 md:py-12">
        <header className="mb-8 flex items-center gap-4">
          <Image
            src="/icon.svg"
            alt="Fútbol Stats Zone Logo"
            width={48}
            height={48}
          />
          <h1 className="text-4xl font-bold tracking-tight">
            Fútbol Stats Zone
          </h1>
        </header>

        <div className="mb-8 flex w-full justify-center">
          <div className="w-3/4">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image
                src="https://placehold.co/970x90.png"
                alt="Banner Ad"
                width={970}
                height={90}
                className="w-full h-auto rounded-lg"
                data-ai-hint="advertisement banner"
              />
            </a>
          </div>
        </div>
        
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Encuentros del día</TabsTrigger>
            <TabsTrigger value="by-date">Por fecha</TabsTrigger>
            <TabsTrigger value="by-league">Por liga</TabsTrigger>
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
      <footer className="w-full py-4 text-center text-sm text-muted-foreground">
        © 2025 Fútbol Stats Zone. Todos los derechos reservados.
      </footer>
    </div>
  );
}
