"use client";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MatchList } from "@/components/match-list";

export function MatchesByLeague() {
  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="country-select">País</Label>
          <Select>
            <SelectTrigger id="country-select">
              <SelectValue placeholder="Seleccionar país" />
            </SelectTrigger>
            <SelectContent>
              {/* Country options would be populated here */}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="league-select">Liga</Label>
          <Select disabled>
            <SelectTrigger id="league-select">
              <SelectValue placeholder="Seleccionar liga" />
            </SelectTrigger>
            <SelectContent>
              {/* League options would be populated here */}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="matchday-select">Jornada</Label>
          <Select disabled>
            <SelectTrigger id="matchday-select">
              <SelectValue placeholder="Seleccionar jornada" />
            </SelectTrigger>
            <SelectContent>
              {/* Matchday options would be populated here */}
            </SelectContent>
          </Select>
        </div>
      </div>
      <MatchList />
    </div>
  );
}
