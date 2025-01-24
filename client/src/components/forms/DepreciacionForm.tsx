import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import type { Depreciacion, Activo } from "@db/schema";
import { useEffect } from "react";

const MESES = [
  { value: "seleccionar", label: "Seleccionar" },
  { value: "ENERO", label: "Enero" },
  { value: "FEBRERO", label: "Febrero" },
  { value: "MARZO", label: "Marzo" },
  { value: "ABRIL", label: "Abril" },
  { value: "MAYO", label: "Mayo" },
  { value: "JUNIO", label: "Junio" },
  { value: "JULIO", label: "Julio" },
  { value: "AGOSTO", label: "Agosto" },
  { value: "SEPTIEMBRE", label: "Septiembre" },
  { value: "OCTUBRE", label: "Octubre" },
  { value: "NOVIEMBRE", label: "Noviembre" },
  { value: "DICIEMBRE", label: "Diciembre" },
];

const depreciacionSchema = z.object({
  activoId: z.number().min(1, "Debe seleccionar un activo"),
  cuentaDebe: z.string().min(1, "La cuenta debe es requerida"),
  cuentaHaber: z.string().min(1, "La cuenta haber es requerida"),
  centroCosto: z.string().default(""),
  mes: z.string().min(1, "Debe seleccionar un mes").refine(value => value !== "seleccionar", {
    message: "Debe seleccionar un mes válido"
  }),
  tipoCambio: z.number().min(0, "El tipo de cambio debe ser mayor a 0"),
  porcentajeDepreciacion: z.number().min(0, "El porcentaje debe ser mayor o igual a 0"),
  depreciacionAcumuladaAnterior: z.number().min(0),
  depreciacionEjercicio: z.number().min(0),
  depreciacionRetiros: z.number().min(0).default(0),
  depreciacionOtrosAjustes: z.number().min(0).default(0),
  depreciacionAcumuladaHistorica: z.number().min(0),
  ajustePorInflacionDepreciacion: z.number().min(0).default(0),
  depreciacionAcumuladaAjustada: z.number().min(0),
});

type DepreciacionFormData = z.infer<typeof depreciacionSchema>;

interface DepreciacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Depreciacion;
}

export function DepreciacionForm({ open, onOpenChange, defaultValues }: DepreciacionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activos } = useQuery<Activo[]>({
    queryKey: ["/api/activos"],
  });

  const form = useForm<DepreciacionFormData>({
    resolver: zodResolver(depreciacionSchema),
    defaultValues: {
      activoId: 0,
      cuentaDebe: "",
      cuentaHaber: "",
      centroCosto: "",
      mes: "seleccionar",
      tipoCambio: 1,
      porcentajeDepreciacion: 0,
      depreciacionAcumuladaAnterior: 0,
      depreciacionEjercicio: 0,
      depreciacionRetiros: 0,
      depreciacionOtrosAjustes: 0,
      depreciacionAcumuladaHistorica: 0,
      ajustePorInflacionDepreciacion: 0,
      depreciacionAcumuladaAjustada: 0,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        activoId: defaultValues.activoId,
        cuentaDebe: defaultValues.cuentaDebe || "",
        cuentaHaber: defaultValues.cuentaHaber || "",
        centroCosto: defaultValues.centroCosto || "",
        mes: defaultValues.mes || "seleccionar",
        tipoCambio: Number(defaultValues.tipoCambio) || 1,
        porcentajeDepreciacion: Number(defaultValues.porcentajeDepreciacion),
        depreciacionAcumuladaAnterior: Number(defaultValues.depreciacionAcumuladaAnterior),
        depreciacionEjercicio: Number(defaultValues.depreciacionEjercicio),
        depreciacionRetiros: Number(defaultValues.depreciacionRetiros) || 0,
        depreciacionOtrosAjustes: Number(defaultValues.depreciacionOtrosAjustes) || 0,
        depreciacionAcumuladaHistorica: Number(defaultValues.depreciacionAcumuladaHistorica),
        ajustePorInflacionDepreciacion: Number(defaultValues.ajustePorInflacionDepreciacion) || 0,
        depreciacionAcumuladaAjustada: Number(defaultValues.depreciacionAcumuladaAjustada),
      });
    }
  }, [defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: DepreciacionFormData) => {
      const response = await fetch(
        defaultValues ? `/api/depreciacion/${defaultValues.id}` : "/api/depreciacion",
        {
          method: defaultValues ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar la depreciación");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/depreciacion"] });
      toast({
        title: "Éxito",
        description: `Depreciación ${defaultValues ? "actualizada" : "registrada"} correctamente`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la depreciación",
      });
    },
  });

  function onSubmit(data: DepreciacionFormData) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-2xl flex flex-col p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>
            {defaultValues ? "Editar Depreciación" : "Nueva Depreciación"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                <FormField
                  control={form.control}
                  name="activoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activo</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                        disabled={!!defaultValues}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar activo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activos?.map((activo) => (
                            <SelectItem key={activo.id} value={activo.id.toString()}>
                              {activo.codigoActivo} - {activo.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuentaDebe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta Debe</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese cuenta debe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuentaHaber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta Haber</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese cuenta haber" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="centroCosto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centro de Costo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese centro de costo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar mes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MESES.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value}>
                              {mes.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipoCambio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cambio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="porcentajeDepreciacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% de Depreciación</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depreciacionAcumuladaAnterior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depreciación Acumulada (Ejercicio Anterior)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depreciacionEjercicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depreciación del Ejercicio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depreciacionRetiros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depreciación por Retiros/Bajas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depreciacionOtrosAjustes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ajustes de Depreciación</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depreciacionAcumuladaHistorica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depreciación Histórica</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ajustePorInflacionDepreciacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ajuste por Inflación (Depreciación)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depreciacionAcumuladaAjustada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depreciación Ajustada</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
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
            {defaultValues ? "Actualizar" : "Registrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}