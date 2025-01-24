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
import { FinancieroForm } from "@/components/forms/FinancieroForm";

export default function Financiero() {
  const [open, setOpen] = useState(false);
  const { data: financiero, isLoading } = useQuery({
    queryKey: ["/api/financiero"],
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financiero</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Costo</TableHead>
                <TableHead>Meses Depreciación</TableHead>
                <TableHead>Porcentaje Depreciación</TableHead>
                <TableHead>Cuenta Activo</TableHead>
                <TableHead>Cuenta Depreciación</TableHead>
                <TableHead>Cuenta Gasto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financiero?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.costo}</TableCell>
                  <TableCell>{item.mesesDepreciacion}</TableCell>
                  <TableCell>{item.porcentajeDepreciacion}%</TableCell>
                  <TableCell>{item.ctaActivo}</TableCell>
                  <TableCell>{item.ctaDepreciacion}</TableCell>
                  <TableCell>{item.ctaGasto}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FinancieroForm open={open} onOpenChange={setOpen} />
    </div>
  );
}