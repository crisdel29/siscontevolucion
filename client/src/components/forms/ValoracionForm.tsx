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
import { useToast } from "@/hooks/use-toast";
import type { Valoracion, Activo } from "@db/schema";

const valoracionSchema = z.object({
  activoId: z.number().min(1, "Debe seleccionar un activo"),
  valorHistorico: z.string().transform(Number),
  ajustePorInflacion: z.string().default("0").transform(Number),
  valorAjustado: z.string().transform(Number),
});

type ValoracionFormData = z.infer<typeof valoracionSchema>;

interface ValoracionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Valoracion;
}

export function ValoracionForm({ open, onOpenChange, defaultValues }: ValoracionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activos } = useQuery<Activo[]>({
    queryKey: ["/api/activos"],
  });

  const form = useForm<ValoracionFormData>({
    resolver: zodResolver(valoracionSchema),
    defaultValues: {
      activoId: defaultValues?.activoId || 0,
      valorHistorico: defaultValues?.valorHistorico?.toString() || "0",
      ajustePorInflacion: defaultValues?.ajustePorInflacion?.toString() || "0",
      valorAjustado: defaultValues?.valorAjustado?.toString() || "0",
    },
  });

  // Calcular valorAjustado cuando cambian valorHistorico o ajustePorInflacion
  const valorHistorico = Number(form.watch("valorHistorico")) || 0;
  const ajustePorInflacion = Number(form.watch("ajustePorInflacion")) || 0;
  const valorAjustado = valorHistorico + ajustePorInflacion;

  form.setValue("valorAjustado", valorAjustado.toString());

  const mutation = useMutation({
    mutationFn: async (data: ValoracionFormData) => {
      const response = await fetch(defaultValues ? `/api/valoracion/${defaultValues.id}` : "/api/valoracion", {
        method: defaultValues ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la valoración");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valoracion"] });
      toast({
        title: "Éxito",
        description: `Valoración ${defaultValues ? 'actualizada' : 'registrada'} correctamente`,
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la valoración",
      });
    },
  });

  function onSubmit(data: ValoracionFormData) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? 'Editar Valoración' : 'Nueva Valoración'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="activoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
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
                name="valorHistorico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Histórico</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ajustePorInflacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ajuste por Inflación</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valorAjustado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Ajustado</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {defaultValues ? 'Actualizar' : 'Registrar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}