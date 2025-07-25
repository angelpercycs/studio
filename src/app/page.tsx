import { DailyMatches } from '@/components/daily-matches';
import { MatchesByDate } from '@/components/matches-by-date';
import { MatchesByLeague } from '@/components/matches-by-league';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-xl font-bold">FSZ</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Fútbol Stats Zone
          </h1>
        </header>
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
    </div>
  );
}
