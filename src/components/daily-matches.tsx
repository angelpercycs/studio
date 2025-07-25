"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchList } from "@/components/match-list";

export function DailyMatches() {
  return (
    <Tabs defaultValue="today" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
        <TabsTrigger value="yesterday">Ayer</TabsTrigger>
        <TabsTrigger value="today">Hoy</TabsTrigger>
        <TabsTrigger value="tomorrow">Mañana</TabsTrigger>
      </TabsList>
      <TabsContent value="yesterday">
        <MatchList />
      </TabsContent>
      <TabsContent value="today">
        <MatchList />
      </TabsContent>
      <TabsContent value="tomorrow">
        <MatchList />
      </TabsContent>
    </Tabs>
  );
}
