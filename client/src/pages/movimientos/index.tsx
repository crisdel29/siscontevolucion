import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MovimientoForm } from "@/components/forms/MovimientoForm";
import PeriodoSelector from "@/components/ui/periodo-selector";
import type { Movimiento, Activo } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export default function MovimientosPage() {
  const [open, setOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | undefined>();
  const [selectedPeriodo, setSelectedPeriodo] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: movimientos, isLoading } = useQuery<(Movimiento & { activo: Activo })[]>({
    queryKey: ["/api/movimientos"],
  });

  // Filtrar movimientos por año
  const filteredMovimientos = movimientos?.filter(mov => 
    mov.anio === parseInt(selectedPeriodo)
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/movimientos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error al eliminar el movimiento");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movimientos"] });
      toast({
        title: "Éxito",
        description: "Movimiento eliminado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el movimiento",
      });
    },
  });

  const handleEdit = (movimiento: Movimiento & { activo: Activo }) => {
    setSelectedMovimiento(movimiento);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este movimiento?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Movimientos de Activos</h1>
        <div className="flex items-center space-x-4">
          <PeriodoSelector 
            value={selectedPeriodo}
            onValueChange={setSelectedPeriodo}
          />
          <Button onClick={() => {
            setSelectedMovimiento(undefined);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Activo</TableHead>
                  <TableHead className="whitespace-nowrap">Saldo Inicial</TableHead>
                  <TableHead className="whitespace-nowrap">Adquisiciones</TableHead>
                  <TableHead className="whitespace-nowrap">Mejoras</TableHead>
                  <TableHead className="whitespace-nowrap">Retiros/Bajas</TableHead>
                  <TableHead className="whitespace-nowrap">Otros Ajustes</TableHead>
                  <TableHead className="whitespace-nowrap">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovimientos?.map((movimiento) => (
                  <TableRow key={movimiento.id}>
                    <TableCell className="whitespace-nowrap">{movimiento.activo.codigoActivo}</TableCell>
                    <TableCell className="whitespace-nowrap">S/ {parseFloat(movimiento.saldoInicial).toFixed(2)}</TableCell>
                    <TableCell className="whitespace-nowrap">S/ {parseFloat(movimiento.adquisiciones || "0").toFixed(2)}</TableCell>
                    <TableCell className="whitespace-nowrap">S/ {parseFloat(movimiento.mejoras || "0").toFixed(2)}</TableCell>
                    <TableCell className="whitespace-nowrap">S/ {parseFloat(movimiento.retiros || "0").toFixed(2)}</TableCell>
                    <TableCell className="whitespace-nowrap">S/ {parseFloat(movimiento.otrosAjustes || "0").toFixed(2)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(movimiento)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(movimiento.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MovimientoForm 
        open={open} 
        onOpenChange={setOpen}
        defaultValues={selectedMovimiento}
      />
    </div>
  );
}