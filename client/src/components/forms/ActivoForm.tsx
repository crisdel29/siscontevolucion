import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Activo } from "@db/schema";
import { useEffect } from "react";

const activoSchema = z.object({
  codigoActivo: z.string().min(1, "El código es requerido"),
  cuentaContable: z.string().min(1, "La cuenta contable es requerida"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  fechaAdquisicion: z.string().min(1, "La fecha de adquisición es requerida"),
  fechaUso: z.string().min(1, "La fecha de uso es requerida"),
  metodoAplicado: z.enum(["LINEA_RECTA", "UNIDADES_PRODUCIDAS", "OTROS"]),
  estado: z.string().optional(),
});

type ActivoFormData = z.infer<typeof activoSchema>;

interface ActivoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Activo;
}

export function ActivoForm({ open, onOpenChange, defaultValues }: ActivoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ActivoFormData>({
    resolver: zodResolver(activoSchema),
    defaultValues: {
      codigoActivo: "",
      cuentaContable: "",
      descripcion: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      fechaAdquisicion: "",
      fechaUso: "",
      metodoAplicado: "LINEA_RECTA",
      estado: "ACTIVO",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        codigoActivo: defaultValues.codigoActivo,
        cuentaContable: defaultValues.cuentaContable,
        descripcion: defaultValues.descripcion,
        marca: defaultValues.marca || "",
        modelo: defaultValues.modelo || "",
        numeroSerie: defaultValues.numeroSerie || "",
        fechaAdquisicion: new Date(defaultValues.fechaAdquisicion).toISOString().split('T')[0],
        fechaUso: new Date(defaultValues.fechaUso).toISOString().split('T')[0],
        metodoAplicado: defaultValues.metodoAplicado as "LINEA_RECTA" | "UNIDADES_PRODUCIDAS" | "OTROS",
        estado: defaultValues.estado || "ACTIVO",
      });
    }
  }, [defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: ActivoFormData) => {
      const response = await fetch(
        defaultValues ? `/api/activos/${defaultValues.id}` : "/api/activos",
        {
          method: defaultValues ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar el activo");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activos"] });
      toast({
        title: "Éxito",
        description: `Activo ${defaultValues ? "actualizado" : "creado"} correctamente`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el activo",
      });
    },
  });

  function onSubmit(data: ActivoFormData) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-2xl flex flex-col p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>
            {defaultValues ? "Editar Activo" : "Nuevo Activo"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                <FormField
                  control={form.control}
                  name="codigoActivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del Activo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuentaContable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta Contable</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numeroSerie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Serie/Placa</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaAdquisicion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Adquisición</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaUso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Uso</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metodoAplicado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método Aplicado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LINEA_RECTA">Línea Recta</SelectItem>
                          <SelectItem value="UNIDADES_PRODUCIDAS">Unidades Producidas</SelectItem>
                          <SelectItem value="OTROS">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {defaultValues ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}