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
import { DepreciacionForm } from "@/components/forms/DepreciacionForm";
import PeriodoSelector from "@/components/ui/periodo-selector";
import type { Depreciacion, Activo } from "@db/schema";

export default function DepreciacionPage() {
  const [open, setOpen] = useState(false);
  const [selectedDepreciacion, setSelectedDepreciacion] = useState<Depreciacion | undefined>();
  const [selectedPeriodo, setSelectedPeriodo] = useState(new Date().getFullYear().toString());

  const { data: depreciaciones, isLoading } = useQuery<(Depreciacion & { activo: Activo })[]>({
    queryKey: ["/api/depreciacion"],
  });

  // Filtrar depreciaciones por año
  const filteredDepreciaciones = depreciaciones?.filter(dep => 
    dep.anio === parseInt(selectedPeriodo)
  );

  const handleEdit = (depreciacion: Depreciacion & { activo: Activo }) => {
    setSelectedDepreciacion(depreciacion);
    setOpen(true);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Depreciación de Activos</h1>
        <div className="flex items-center space-x-4">
          <PeriodoSelector 
            value={selectedPeriodo}
            onValueChange={setSelectedPeriodo}
          />
          <Button onClick={() => {
            setSelectedDepreciacion(undefined);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Depreciación
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Depreciaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>% Depreciación</TableHead>
                  <TableHead>Dep. Acumulada Anterior</TableHead>
                  <TableHead>Dep. del Ejercicio</TableHead>
                  <TableHead>Dep. por Retiros</TableHead>
                  <TableHead>Ajustes Dep.</TableHead>
                  <TableHead>Dep. Histórica</TableHead>
                  <TableHead>Ajuste Inflación</TableHead>
                  <TableHead>Dep. Ajustada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepreciaciones?.map((depreciacion) => (
                  <TableRow key={depreciacion.id}>
                    <TableCell>{depreciacion.activo.codigoActivo}</TableCell>
                    <TableCell>{parseFloat(depreciacion.porcentajeDepreciacion).toFixed(2)}%</TableCell>
                    <TableCell>S/ {parseFloat(depreciacion.depreciacionAcumuladaAnterior).toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(depreciacion.depreciacionEjercicio).toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(depreciacion.depreciacionRetiros || "0").toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(depreciacion.depreciacionOtrosAjustes || "0").toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(depreciacion.depreciacionAcumuladaHistorica).toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(depreciacion.ajustePorInflacionDepreciacion || "0").toFixed(2)}</TableCell>
                    <TableCell>S/ {parseFloat(depreciacion.depreciacionAcumuladaAjustada).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(depreciacion)}
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

      <DepreciacionForm 
        open={open} 
        onOpenChange={setOpen}
        defaultValues={selectedDepreciacion}
      />
    </div>
  );
}