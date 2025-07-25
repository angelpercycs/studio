import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCaption,
} from "@/components/ui/table";

export function MatchList() {
  return (
    <div className="mt-6 rounded-lg border">
      <Table>
        <TableCaption>No hay encuentros para mostrar.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Hora</TableHead>
            <TableHead>Equipo Local</TableHead>
            <TableHead className="w-[100px] text-center">Resultado</TableHead>
            <TableHead>Equipo Visitante</TableHead>
            <TableHead className="text-right">Liga</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{/* Match data will be mapped here */}</TableBody>
      </Table>
    </div>
  );
}
