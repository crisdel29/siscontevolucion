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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Empresa } from "@db/schema";
import { useEffect } from "react";

const empresaSchema = z.object({
  ruc: z.string().min(11, "El RUC debe tener 11 dígitos").max(11),
  razonSocial: z.string().min(1, "La razón social es requerida"),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Empresa;
}

export function EmpresaForm({ open, onOpenChange, defaultValues }: EmpresaFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      ruc: "",
      razonSocial: "",
    },
  });

  // Update form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ruc: defaultValues.ruc,
        razonSocial: defaultValues.razonSocial,
      });
    }
  }, [defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: EmpresaFormData) => {
      const response = await fetch("/api/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar los datos de la empresa");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/empresa"] });
      toast({
        title: "Éxito",
        description: "Datos de la empresa guardados correctamente",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Error en mutation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudieron guardar los datos",
      });
    },
  });

  function onSubmit(data: EmpresaFormData) {
    console.log("Enviando datos:", data);
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Datos de la Empresa</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-full px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={11} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="razonSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social</FormLabel>
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
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                >
                  Guardar
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}