import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ValoracionForm } from "@/components/forms/ValoracionForm";
import PeriodoSelector from "@/components/ui/periodo-selector";
import type { Valoracion, Activo } from "@db/schema";

export default function ValoracionPage() {
  const [open, setOpen] = useState(false);
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | undefined>();
  const [selectedPeriodo, setSelectedPeriodo] = useState(new Date().getFullYear().toString());

  const { data: valoraciones, isLoading } = useQuery<(Valoracion & { activo: Activo })[]>({
    queryKey: ["/api/valoracion"],
  });

  // Filtrar valoraciones por año
  const filteredValoraciones = valoraciones?.filter(val => 
    val.anio === parseInt(selectedPeriodo)
  );

  const handleEdit = (valoracion: Valoracion & { activo: Activo }) => {
    setSelectedValoracion(valoracion);
    setOpen(true);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Valoración de Activos</h1>
        <div className="flex items-center space-x-4">
          <PeriodoSelector 
            value={selectedPeriodo}
            onValueChange={setSelectedPeriodo}
          />
          <Button onClick={() => {
            setSelectedValoracion(undefined);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Valoración
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Valoraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>Valor Histórico</TableHead>
                  <TableHead>Ajuste por Inflación</TableHead>
                  <TableHead>Valor Ajustado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValoraciones?.map((valoracion) => (
                  <TableRow key={valoracion.id}>
                    <TableCell>{valoracion.activo.codigoActivo}</TableCell>
                    <TableCell>S/ {parseFloat(valoracion.valorHistorico).toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(valoracion.ajustePorInflacion || "0").toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(valoracion.valorAjustado).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(valoracion)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ValoracionForm 
        open={open} 
        onOpenChange={setOpen}
        defaultValues={selectedValoracion}
      />
    </div>
  );
}