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
import { ActivoForm } from "@/components/forms/ActivoForm";
import PeriodoSelector from "@/components/ui/periodo-selector";
import { LoadingSpinner, LoadingOverlay } from "@/components/LoadingSpinner";
import type { Activo } from "@db/schema";

export default function Activos() {
  const [open, setOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState<Activo | undefined>();
  const [selectedPeriodo, setSelectedPeriodo] = useState(new Date().getFullYear().toString());

  const { data: activos, isLoading } = useQuery<Activo[]>({
    queryKey: ["/api/activos"],
  });

  // Filtrar activos por año de fecha de uso
  const filteredActivos = activos?.filter(activo => 
    new Date(activo.fechaUso).getFullYear() === parseInt(selectedPeriodo)
  );

  const handleEdit = (activo: Activo) => {
    setSelectedActivo(activo);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activos</h1>
        <div className="flex items-center space-x-4">
          <PeriodoSelector 
            value={selectedPeriodo}
            onValueChange={setSelectedPeriodo}
          />
          <Button onClick={() => {
            setSelectedActivo(undefined);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto relative">
            {isLoading && <LoadingOverlay />}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cuenta Contable</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Serie/Placa</TableHead>
                  <TableHead>Fecha Adquisición</TableHead>
                  <TableHead>Fecha Uso</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivos?.map((activo) => (
                  <TableRow key={activo.id}>
                    <TableCell>{activo.codigoActivo}</TableCell>
                    <TableCell>{activo.cuentaContable}</TableCell>
                    <TableCell>{activo.descripcion}</TableCell>
                    <TableCell>{activo.marca}</TableCell>
                    <TableCell>{activo.modelo}</TableCell>
                    <TableCell>{activo.numeroSerie}</TableCell>
                    <TableCell>
                      {new Date(activo.fechaAdquisicion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(activo.fechaUso).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {activo.metodoAplicado === 'LINEA_RECTA' ? 'Línea Recta' :
                       activo.metodoAplicado === 'UNIDADES_PRODUCIDAS' ? 'Unidades Producidas' : 'Otros'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(activo)}
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

      <ActivoForm 
        open={open} 
        onOpenChange={setOpen} 
        defaultValues={selectedActivo}
      />
    </div>
  );
}