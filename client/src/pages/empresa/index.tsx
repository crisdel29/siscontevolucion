import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Edit } from "lucide-react";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
import type { Empresa } from "@db/schema";

export default function EmpresaPage() {
  const [open, setOpen] = useState(false);
  const { data: empresa } = useQuery<Empresa>({
    queryKey: ["/api/empresa"],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración de la Empresa</h1>
        <Button onClick={() => setOpen(true)}>
          {empresa ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Editar Datos
            </>
          ) : (
            <>
              <Building2 className="mr-2 h-4 w-4" />
              Configurar Empresa
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          {empresa ? (
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">RUC</dt>
                <dd className="mt-1 text-lg text-gray-900">{empresa.ruc}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Razón Social</dt>
                <dd className="mt-1 text-lg text-gray-900">{empresa.razonSocial}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No hay datos de empresa configurados
            </p>
          )}
        </CardContent>
      </Card>

      <EmpresaForm 
        open={open} 
        onOpenChange={setOpen} 
        defaultValues={empresa || undefined}
      />
    </div>
  );
}