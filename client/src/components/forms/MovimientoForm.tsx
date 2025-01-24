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
import type { Movimiento, Activo } from "@db/schema";
import { useEffect } from "react";

const movimientoSchema = z.object({
  activoId: z.number().min(1, "Debe seleccionar un activo"),
  saldoInicial: z.string().transform((val) => Number(val) || 0),
  adquisiciones: z.string().default("0").transform((val) => Number(val) || 0),
  mejoras: z.string().default("0").transform((val) => Number(val) || 0),
  retiros: z.string().default("0").transform((val) => Number(val) || 0),
  otrosAjustes: z.string().default("0").transform((val) => Number(val) || 0),
});

type MovimientoFormData = z.infer<typeof movimientoSchema>;

interface MovimientoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Movimiento;
}

export function MovimientoForm({ open, onOpenChange, defaultValues }: MovimientoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activos } = useQuery<Activo[]>({
    queryKey: ["/api/activos"],
  });

  const form = useForm<MovimientoFormData>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      activoId: 0,
      saldoInicial: "0",
      adquisiciones: "0",
      mejoras: "0",
      retiros: "0",
      otrosAjustes: "0",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        activoId: defaultValues.activoId || 0,
        saldoInicial: defaultValues.saldoInicial.toString(),
        adquisiciones: defaultValues.adquisiciones?.toString() || "0",
        mejoras: defaultValues.mejoras?.toString() || "0",
        retiros: defaultValues.retiros?.toString() || "0",
        otrosAjustes: defaultValues.otrosAjustes?.toString() || "0",
      });
    }
  }, [defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: MovimientoFormData) => {
      const response = await fetch(
        defaultValues ? `/api/movimientos/${defaultValues.id}` : "/api/movimientos",
        {
          method: defaultValues ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar el movimiento");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movimientos"] });
      toast({
        title: "Éxito",
        description: `Movimiento ${defaultValues ? "actualizado" : "registrado"} correctamente`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el movimiento",
      });
    },
  });

  function onSubmit(data: MovimientoFormData) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-2xl flex flex-col p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>
            {defaultValues ? "Editar Movimiento" : "Nuevo Movimiento"}
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
                  name="saldoInicial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saldo Inicial</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adquisiciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adquisiciones/Adiciones</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mejoras"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mejoras</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retiros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retiros/Bajas</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otrosAjustes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Otros Ajustes</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
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