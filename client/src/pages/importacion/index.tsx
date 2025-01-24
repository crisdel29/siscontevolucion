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
import { Upload, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Importacion() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: previewData = [], isLoading: isLoadingPreview } = useQuery<any[]>({
    queryKey: ["/api/importacion/preview"],
    enabled: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/importacion/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar el archivo");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/importacion/preview"], data.preview);
      setHeaders(data.headers || []);
      toast({
        title: "Éxito",
        description: "Archivo cargado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo cargar el archivo",
      });
    },
  });

  const distribuirMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/importacion/distribuir", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al distribuir los datos");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movimientos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/valoracion"] });
      queryClient.invalidateQueries({ queryKey: ["/api/depreciacion"] });
      queryClient.setQueryData(["/api/importacion/preview"], []);

      toast({
        title: "Éxito",
        description: "Datos distribuidos correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudieron distribuir los datos",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Importación de Datos</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Button asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Cargar Excel
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </label>
            </Button>
          </div>
          <Button
            onClick={() => distribuirMutation.mutate()}
            disabled={!previewData.length || distribuirMutation.isPending}
          >
            <Database className="mr-2 h-4 w-4" />
            Distribuir Datos
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Vista Previa de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            {isLoadingPreview ? (
              <div className="text-center py-4">Cargando datos...</div>
            ) : Array.isArray(previewData) && previewData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead key={header} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row: any, index: number) => (
                    <TableRow key={index}>
                      {headers.map((header) => (
                        <TableCell key={header} className="whitespace-nowrap">
                          {row[header] !== undefined ? String(row[header]) : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Cargue un archivo Excel para ver la vista previa
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}