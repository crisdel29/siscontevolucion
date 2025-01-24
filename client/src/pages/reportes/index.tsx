import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import PeriodoSelector from "@/components/ui/periodo-selector";
import type { Activo, Movimiento, Valoracion, Depreciacion, Empresa } from "@db/schema";

export default function ReportesPage() {
  const [selectedTab, setSelectedTab] = useState("formato71");
  const [selectedPeriodo, setSelectedPeriodo] = useState(new Date().getFullYear().toString());
  const [manualPeriodo, setManualPeriodo] = useState(new Date().getFullYear().toString());

  const { data: empresa } = useQuery<Empresa>({
    queryKey: ["/api/empresa"],
  });

  const { data: activos } = useQuery<Activo[]>({
    queryKey: ["/api/activos"],
  });

  const { data: movimientos } = useQuery<(Movimiento & { activo: Activo })[]>({
    queryKey: ["/api/movimientos"],
  });

  const { data: valoraciones } = useQuery<(Valoracion & { activo: Activo })[]>({
    queryKey: ["/api/valoracion"],
  });

  const { data: depreciaciones } = useQuery<(Depreciacion & { activo: Activo })[]>({
    queryKey: ["/api/depreciacion"],
  });

  // Filtrar datos por año seleccionado
  const filteredActivos = activos?.filter(activo =>
    selectedPeriodo === "todos" ? true : new Date(activo.fechaUso).getFullYear() === parseInt(selectedPeriodo)
  );

  const filteredMovimientos = movimientos?.filter(mov =>
    selectedPeriodo === "todos" ? true : mov.anio === parseInt(selectedPeriodo)
  );

  const filteredValoraciones = valoraciones?.filter(val =>
    selectedPeriodo === "todos" ? true : val.anio === parseInt(selectedPeriodo)
  );

  const filteredDepreciaciones = depreciaciones?.filter(dep =>
    selectedPeriodo === "todos" ? true : dep.anio === parseInt(selectedPeriodo)
  );

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/reportes/exportar?tipo=${selectedTab}&anio=${selectedPeriodo}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${selectedTab}-${selectedPeriodo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const calcularTotales = (
    activos: Activo[] = [],
    movimientos: (Movimiento & { activo: Activo })[] = [],
    valoraciones: (Valoracion & { activo: Activo })[] = [],
    depreciaciones: (Depreciacion & { activo: Activo })[] = []
  ) => {
    return {
      saldoInicial: movimientos.reduce((sum, mov) => sum + parseFloat(mov.saldoInicial || "0"), 0),
      adquisiciones: movimientos.reduce((sum, mov) => sum + parseFloat(mov.adquisiciones || "0"), 0),
      mejoras: movimientos.reduce((sum, mov) => sum + parseFloat(mov.mejoras || "0"), 0),
      retiros: movimientos.reduce((sum, mov) => sum + parseFloat(mov.retiros || "0"), 0),
      otrosAjustes: movimientos.reduce((sum, mov) => sum + parseFloat(mov.otrosAjustes || "0"), 0),
      valorHistorico: valoraciones.reduce((sum, val) => sum + parseFloat(val.valorHistorico || "0"), 0),
      ajustePorInflacion: valoraciones.reduce((sum, val) => sum + parseFloat(val.ajustePorInflacion || "0"), 0),
      valorAjustado: valoraciones.reduce((sum, val) => sum + parseFloat(val.valorAjustado || "0"), 0),
      depreciacionAcumuladaAnterior: depreciaciones.reduce((sum, dep) => sum + parseFloat(dep.depreciacionAcumuladaAnterior || "0"), 0),
      depreciacionEjercicio: depreciaciones.reduce((sum, dep) => sum + parseFloat(dep.depreciacionEjercicio || "0"), 0),
      depreciacionRetiros: depreciaciones.reduce((sum, dep) => sum + parseFloat(dep.depreciacionRetiros || "0"), 0),
      depreciacionOtrosAjustes: depreciaciones.reduce((sum, dep) => sum + parseFloat(dep.depreciacionOtrosAjustes || "0"), 0),
      depreciacionAcumuladaHistorica: depreciaciones.reduce((sum, dep) => sum + parseFloat(dep.depreciacionAcumuladaHistorica || "0"), 0),
      ajustePorInflacionDepreciacion: depreciaciones.reduce((sum, dep) => sum + parseFloat(dep.ajustePorInflacionDepreciacion || "0"), 0),
      depreciacionAcumuladaAjustada: depreciaciones.reduce((sum, dep) => sum + parseFloat(dep.depreciacionAcumuladaAjustada || "0"), 0),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reportes de Activos - Formato 7.1</h1>
        <div className="flex items-center space-x-4">
          <PeriodoSelector
            value={selectedPeriodo}
            onValueChange={setSelectedPeriodo}
          />
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      <Tabs defaultValue="formato71" className="space-y-4" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="formato71">Formato 7.1</TabsTrigger>
          <TabsTrigger value="resumen">Resumen General</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="depreciacion">Depreciación Detallada</TabsTrigger>
          <TabsTrigger value="ajustes">Histórico de Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="formato71">
          <Card>
            <CardHeader>
              <CardTitle>Formato 7.1: Registro de Activos Fijos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden border rounded-lg">
                    <div className="p-4 border-b space-y-2">
                      <div className="grid grid-cols-[120px,1fr] gap-2">
                        <div className="font-bold">PERIODO:</div>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={manualPeriodo}
                            onChange={(e) => setManualPeriodo(e.target.value)}
                            className="border rounded px-2 py-1 w-24"
                          />
                        </div>
                        <div className="font-bold">RUC:</div>
                        <div>{empresa?.ruc || '-'}</div>
                        <div className="font-bold">APELLIDOS Y NOMBRES, DENOMINACIÓN O RAZÓN SOCIAL:</div>
                        <div>{empresa?.razonSocial || '-'}</div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="text-center border font-bold text-xs whitespace-nowrap px-2" colSpan={6}>
                            IDENTIFICACIÓN DEL ACTIVO FIJO
                          </TableHead>
                          <TableHead className="text-center border font-bold text-xs whitespace-nowrap px-2" colSpan={5}>
                            MOVIMIENTOS DEL EJERCICIO
                          </TableHead>
                          <TableHead className="text-center border font-bold text-xs whitespace-nowrap px-2" colSpan={3}>
                            VALOR DEL ACTIVO FIJO
                          </TableHead>
                          <TableHead className="text-center border font-bold text-xs whitespace-nowrap px-2" colSpan={4}>
                            DATOS DE LA DEPRECIACIÓN
                          </TableHead>
                          <TableHead className="text-center border font-bold text-xs whitespace-nowrap px-2" colSpan={7}>
                            DEPRECIACIÓN
                          </TableHead>
                        </TableRow>
                        <TableRow className="bg-gray-50">
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Código Relacionado</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Cuenta Contable</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Descripción</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Marca</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Modelo</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">N° Serie/Placa</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Saldo Inicial</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Adquisiciones/Adiciones</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Mejoras</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Retiros y/o Bajas</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Otros Ajustes</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Valor Histórico del Activo Fijo al 31.12</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Ajuste por Inflación</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Valor Ajustado del Activo Fijo al 31.12</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Fecha de Adquisición</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Fecha de Inicio del Uso del Activo Fijo</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Método Aplicado</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">N° de Documento de Autorización</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Porcentaje de Depreciación</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Depreciación Acumulada al Cierre del Ejercicio Anterior</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Depreciación del Ejercicio</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Depreciación del Ejercicio Relacionada con los Retiros y/o Bajas</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Depreciación Relacionada con Otros Ajustes</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Depreciación Acumulada Histórica</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Ajuste por Inflación de la Depreciación</TableHead>
                          <TableHead className="border font-semibold text-xs p-1 whitespace-nowrap">Depreciación Acumulada Ajustada por Inflación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredActivos?.map((activo) => {
                          const movimiento = filteredMovimientos?.find(m => m.activoId === activo.id);
                          const valoracion = filteredValoraciones?.find(v => v.activoId === activo.id);
                          const depreciacion = filteredDepreciaciones?.find(d => d.activoId === activo.id);

                          return (
                            <TableRow key={activo.id}>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.codigoActivo}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.cuentaContable}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.descripcion}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.marca}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.modelo}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.numeroSerie}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {movimiento?.saldoInicial || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {movimiento?.adquisiciones || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {movimiento?.mejoras || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {movimiento?.retiros || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {movimiento?.otrosAjustes || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {valoracion?.valorHistorico || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {valoracion?.ajustePorInflacion || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {valoracion?.valorAjustado || "0.00"}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.fechaAdquisicion}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.fechaUso}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.metodoAplicado}</TableCell>
                              <TableCell className="border text-xs p-1 whitespace-nowrap">{activo.numeroAutorizacion}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">{depreciacion?.porcentajeDepreciacion || "0.00"}%</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {depreciacion?.depreciacionAcumuladaAnterior || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {depreciacion?.depreciacionEjercicio || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {depreciacion?.depreciacionRetiros || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {depreciacion?.depreciacionOtrosAjustes || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {depreciacion?.depreciacionAcumuladaHistorica || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {depreciacion?.ajustePorInflacionDepreciacion || "0.00"}</TableCell>
                              <TableCell className="border text-right text-xs p-1 whitespace-nowrap">S/ {depreciacion?.depreciacionAcumuladaAjustada || "0.00"}</TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredActivos && filteredMovimientos && filteredValoraciones && filteredDepreciaciones && filteredActivos.length > 0 && (
                          <TableRow className="font-bold bg-gray-50 sticky bottom-0">
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1 font-bold">TOTALES</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).saldoInicial.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).adquisiciones.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).mejoras.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).retiros.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).otrosAjustes.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).valorHistorico.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).ajustePorInflacion.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).valorAjustado.toFixed(2)}</TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-xs p-1"></TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).depreciacionAcumuladaAnterior.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).depreciacionEjercicio.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).depreciacionRetiros.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).depreciacionOtrosAjustes.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).depreciacionAcumuladaHistorica.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).ajustePorInflacionDepreciacion.toFixed(2)}</TableCell>
                            <TableCell className="border text-right text-xs p-1">S/ {calcularTotales(filteredActivos, filteredMovimientos, filteredValoraciones, filteredDepreciaciones).depreciacionAcumuladaAjustada.toFixed(2)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumen">
          <Card>
            <CardHeader>
              <CardTitle>Resumen General de Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Valor Histórico</TableHead>
                    <TableHead>Valor Ajustado</TableHead>
                    <TableHead>Depreciación Acumulada</TableHead>
                    <TableHead>Valor Neto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivos?.map((activo) => {
                    const valoracion = filteredValoraciones?.find(v => v.activoId === activo.id);
                    const depreciacion = filteredDepreciaciones?.find(d => d.activoId === activo.id);
                    const valorNeto = valoracion
                      ? parseFloat(valoracion.valorAjustado) - (depreciacion ? parseFloat(depreciacion.depreciacionAcumuladaAjustada) : 0)
                      : 0;

                    return (
                      <TableRow key={activo.id}>
                        <TableCell>{activo.codigoActivo}</TableCell>
                        <TableCell>{activo.descripcion}</TableCell>
                        <TableCell>S/ {valoracion ? parseFloat(valoracion.valorHistorico).toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {valoracion ? parseFloat(valoracion.valorAjustado).toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {depreciacion ? parseFloat(depreciacion.depreciacionAcumuladaAjustada).toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {valorNeto.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimientos">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activo</TableHead>
                    <TableHead>Saldo Inicial</TableHead>
                    <TableHead>Adquisiciones</TableHead>
                    <TableHead>Mejoras</TableHead>
                    <TableHead>Retiros/Bajas</TableHead>
                    <TableHead>Otros Ajustes</TableHead>
                    <TableHead>Saldo Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovimientos?.map((movimiento) => {
                    const saldoFinal =
                      parseFloat(movimiento.saldoInicial) +
                      parseFloat(movimiento.adquisiciones || "0") +
                      parseFloat(movimiento.mejoras || "0") -
                      parseFloat(movimiento.retiros || "0") +
                      parseFloat(movimiento.otrosAjustes || "0");
                    return (
                      <TableRow key={movimiento.id}>
                        <TableCell>{movimiento.activo.codigoActivo}</TableCell>
                        <TableCell>S/ {parseFloat(movimiento.saldoInicial).toFixed(2)}</TableCell>
                        <TableCell>S/ {parseFloat(movimiento.adquisiciones || "0").toFixed(2)}</TableCell>
                        <TableCell>S/ {parseFloat(movimiento.mejoras || "0").toFixed(2)}</TableCell>
                        <TableCell>S/ {parseFloat(movimiento.retiros || "0").toFixed(2)}</TableCell>
                        <TableCell>S/ {parseFloat(movimiento.otrosAjustes || "0").toFixed(2)}</TableCell>
                        <TableCell>S/ {saldoFinal.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciacion">
          <Card>
            <CardHeader>
              <CardTitle>Depreciación Detallada</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activo</TableHead>
                    <TableHead>% Dep.</TableHead>
                    <TableHead>Dep. Acum. Anterior</TableHead>
                    <TableHead>Dep. Ejercicio</TableHead>
                    <TableHead>Retiros</TableHead>
                    <TableHead>Otros Ajustes</TableHead>
                    <TableHead>Dep. Histórica</TableHead>
                    <TableHead>Ajuste Inflación</TableHead>
                    <TableHead>Dep. Ajustada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepreciaciones?.map((depreciacion) => (
                    <TableRow key={depreciacion.id}>
                      <TableCell>{depreciacion.activo.codigoActivo}</TableCell>
                      <TableCell>{parseFloat(depreciacion.porcentajeDepreciacion).toFixed(2)}%</TableCell>
                      <TableCell>S/ {parseFloat(depreciacion.depreciacionAcumuladaAnterior).toFixed(2)}</TableCell>
                      <TableCell>S/ {parseFloat(depreciacion.depreciacionEjercicio).toFixed(2)}</TableCell>
                      <TableCell>S/ {parseFloat(depreciacion.depreciacionRetiros || "0").toFixed(2)}</TableCell>
                      <TableCell>S/ {parseFloat(depreciacion.depreciacionOtrosAjustes || "0").toFixed(2)}</TableCell>
                      <TableCell>S/ {parseFloat(depreciacion.depreciacionAcumuladaHistorica || "0").toFixed(2)}</TableCell>
                      <TableCell>S/ {parseFloat(depreciacion.ajustePorInflacionDepreciacion || "0").toFixed(2)}</TableCell>
                      <TableCell>S/ {parseFloat(depreciacion.depreciacionAcumuladaAjustada).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ajustes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ajustes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activo</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Ajuste Inflación</TableHead>
                    <TableHead>Valor Ajustado</TableHead>
                    <TableHead>Dep. Original</TableHead>
                    <TableHead>Ajuste Dep.</TableHead>
                    <TableHead>Dep. Ajustada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivos?.map((activo) => {
                    const valoracion = filteredValoraciones?.find(v => v.activoId === activo.id);
                    const depreciacion = filteredDepreciaciones?.find(d => d.activoId === activo.id);
                    return (
                      <TableRow key={activo.id}>
                        <TableCell>{activo.codigoActivo}</TableCell>
                        <TableCell>S/ {valoracion ? parseFloat(valoracion.valorHistorico).toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {valoracion ? parseFloat(valoracion.ajustePorInflacion || "0").toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {valoracion ? parseFloat(valoracion.valorAjustado).toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {depreciacion ? parseFloat(depreciacion.depreciacionAcumuladaHistorica || "0").toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {depreciacion ? parseFloat(depreciacion.ajustePorInflacionDepreciacion || "0").toFixed(2) : "0.00"}</TableCell>
                        <TableCell>S/ {depreciacion ? parseFloat(depreciacion.depreciacionAcumuladaAjustada).toFixed(2) : "0.00"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}