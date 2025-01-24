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
import type { Activo, Moneda, Financiero } from "@db/schema";

const inventarioSchema = z.object({
  activoId: z.number().min(1, "Debe seleccionar un activo"),
  monedaId: z.number().min(1, "Debe seleccionar una moneda"),
  codigoAlmacen: z.string().min(1, "El código de almacén es requerido"),
  cantidad: z.number().min(0, "La cantidad no puede ser negativa"),
  area: z.string().min(1, "El área es requerida"),
  ubicacion: z.string().min(1, "La ubicación es requerida"),
  responsable: z.string().min(1, "El responsable es requerido"),
});

type InventarioFormData = z.infer<typeof inventarioSchema>;

interface InventarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventarioForm({ open, onOpenChange }: InventarioFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener lista de activos y monedas para los selects
  const { data: activos = [] } = useQuery<Activo[]>({
    queryKey: ["/api/activos"],
  });

  const { data: monedas = [] } = useQuery<Moneda[]>({
    queryKey: ["/api/monedas"],
  });

  // Obtener datos financieros para el cálculo automático
  const { data: financieros = [] } = useQuery<Financiero[]>({
    queryKey: ["/api/financiero"],
  });

  const form = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: {
      activoId: 0,
      monedaId: 0,
      codigoAlmacen: "",
      cantidad: 0,
      area: "",
      ubicacion: "",
      responsable: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InventarioFormData) => {
      // Buscar el costo del activo en los datos financieros
      const financiero = financieros.find(f => f.activoId === data.activoId);
      if (!financiero) {
        throw new Error("No se encontró información financiera para este activo");
      }

      const costoXCantidad = financiero.costo * data.cantidad;

      const response = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          costoXCantidad,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el registro de inventario");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventario"] });
      toast({
        title: "Éxito",
        description: "Registro de inventario creado correctamente",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el registro de inventario",
      });
    },
  });

  function onSubmit(data: InventarioFormData) {
    mutation.mutate(data);
  }

  // Encontrar el costo actual basado en el activo seleccionado
  const selectedActivoId = form.watch("activoId");
  const currentFinanciero = financieros.find(f => f.activoId === selectedActivoId);
  const currentCantidad = form.watch("cantidad");
  const calculatedCost = currentFinanciero ? currentFinanciero.costo * currentCantidad : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Registro de Inventario</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="activoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activo</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar activo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activos.map((activo) => (
                        <SelectItem key={activo.id} value={activo.id.toString()}>
                          {activo.codigoProducto} - {activo.nombreActivo}
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
              name="monedaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {monedas.map((moneda) => (
                        <SelectItem key={moneda.id} value={moneda.id.toString()}>
                          {moneda.moneda} ({moneda.tipoCambio})
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
              name="codigoAlmacen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Almacén</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cantidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Mostrar el costo x cantidad calculado */}
            <FormItem>
              <FormLabel>Costo Total (Calculado)</FormLabel>
              <div className="p-2 bg-muted rounded-md">
                {calculatedCost.toFixed(2)}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}