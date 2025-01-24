import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Activo } from "@db/schema";

interface PeriodoSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function PeriodoSelector({ value, onValueChange }: PeriodoSelectorProps) {
  const { data: activos } = useQuery<Activo[]>({
    queryKey: ["/api/activos"],
  });

  // Obtener años únicos de las fechas de uso
  const años = Array.from(
    new Set(
      activos?.map((activo) => 
        new Date(activo.fechaUso).getFullYear()
      )
    )
  ).sort((a, b) => b - a); // Ordenar descendente

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="periodo">Periodo:</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="periodo" className="w-[180px]">
          <SelectValue placeholder="Seleccionar año" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {años.map((año) => (
            <SelectItem key={año} value={año.toString()}>
              {año}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}