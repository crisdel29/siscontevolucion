import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import bcrypt from "bcrypt";
import { users } from "@db/schema";
import { setupAuth } from "./auth";
import ExcelJS from 'exceljs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response } from 'express';
import { activos, depreciacion, empresa } from "@db/schema";

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

function parseNumericValue(value: any): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    const numericValue = value.replace(/[^0-9.-]/g, '');
    return numericValue || '0';
  }
  if (value instanceof Date) {
    return '0';
  }
  return '0';
}

export function registerRoutes(app: Express): Server {
  // Configurar autenticación
  setupAuth(app);

  // Ruta para crear usuario administrador inicial
  app.post("/api/admin/setup", async (req, res) => {
    try {
      // Credenciales predefinidas del administrador
      const adminUser = {
        username: "admin",
        password: "Admin2024@",
        role: "admin",
        nombre: "Administrador Principal",
        email: "admin@siscontevolucion.com"
      };

      // Verificar si ya existe un admin
      const existingAdmin = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, "admin")
      });

      if (existingAdmin) {
        return res.json({ message: "Usuario administrador ya existe" });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);

      // Crear usuario admin
      const result = await db.insert(users).values({
        ...adminUser,
        password: hashedPassword
      });

      res.json({ 
        message: "Usuario administrador creado con éxito",
        credentials: {
          username: adminUser.username,
          password: adminUser.password // Solo mostrar una vez al crear
        }
      });
    } catch (error) {
      console.error("Error al crear usuario admin:", error);
      res.status(500).json({ error: "Error al crear usuario administrador" });
    }
  });

  // Ruta para obtener todos los usuarios (solo admin)
  app.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No ha iniciado sesión");
      }

      const user = req.user as Express.User & { role: string };
      if (user.role !== "admin") {
        return res.status(403).send("No tiene permisos para acceder a este recurso");
      }

      const results = await db.query.users.findMany({
        orderBy: (users, { asc }) => [asc(users.username)],
      });

      // No enviar las contraseñas
      const safeUsers = results.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });

  // Rutas para empresa
  app.get("/api/empresa", async (_req, res) => {
    try {
      const results = await db.query.empresa.findMany({
        limit: 1,
        orderBy: (empresa, { desc }) => [desc(empresa.createdAt)],
      });
      res.json(results[0] || null);
    } catch (error) {
      console.error("Error al obtener empresa:", error);
      res.status(500).json({ error: "Error al obtener datos de la empresa" });
    }
  });

  app.post("/api/empresa", async (req, res) => {
    try {
      const { ruc, razonSocial } = req.body;

      if (!ruc || !razonSocial) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      // Verificar si ya existe una empresa
      const empresaExistente = await db.query.empresa.findFirst();

      if (empresaExistente) {
        // Actualizar empresa existente
        const result = await db
          .update(empresa)
          .set({
            ruc,
            razonSocial,
            updatedAt: new Date()
          })
          .where(eq(empresa.id, empresaExistente.id))
          .returning();
        return res.json(result[0]);
      }

      // Crear nueva empresa
      const result = await db.insert(empresa)
        .values({
          ruc,
          razonSocial,
        })
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error al guardar empresa:", error);
      res.status(500).json({ error: "Error al guardar datos de la empresa" });
    }
  });

  // Rutas para activos con filtro por año
  app.get("/api/activos", async (req, res) => {
    try {
      const año = req.query.año ? parseInt(req.query.año as string) : undefined;

      const results = await db.query.activos.findMany({
        orderBy: (activos, { asc }) => [asc(activos.codigoActivo)],
        where: año ?
          (activos, { and, eq, sql }) =>
            and(eq(sql`EXTRACT(YEAR FROM ${activos.fechaUso})`, año)) :
          undefined,
      });
      res.json(results);
    } catch (error) {
      console.error("Error al obtener activos:", error);
      res.status(500).json({ error: "Error al obtener activos" });
    }
  });

  app.post("/api/activos", async (req, res) => {
    try {
      const nuevoActivo: NewActivo = {
        codigoActivo: req.body.codigoActivo,
        cuentaContable: req.body.cuentaContable,
        descripcion: req.body.descripcion,
        marca: req.body.marca || null,
        modelo: req.body.modelo || null,
        numeroSerie: req.body.numeroSerie || null,
        fechaAdquisicion: new Date(req.body.fechaAdquisicion),
        fechaUso: new Date(req.body.fechaUso),
        metodoAplicado: req.body.metodoAplicado,
        estado: req.body.estado || 'ACTIVO',
      };

      const result = await db.insert(activos).values(nuevoActivo).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error al crear activo:", error);
      res.status(500).json({ error: "Error al crear activo" });
    }
  });

  app.put("/api/activos/:id", async (req, res) => {
    try {
      const result = await db
        .update(activos)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(activos.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error al actualizar activo:", error);
      res.status(500).json({ error: "Error al actualizar activo" });
    }
  });


  // Nueva ruta para cargar el archivo Excel
  app.post("/api/importacion/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        throw new Error("No se encontró ningún archivo");
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error("No se pudo leer la hoja de cálculo");
      }

      const preview: any[] = [];
      let headers: string[] = [];

      // Obtener los headers de la primera fila
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value?.toString() || '');
      });

      // Procesar las filas de datos
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            rowData[header] = cell.value;
          });
          preview.push(rowData);
        }
      });

      res.json({ preview, headers });
    } catch (error) {
      console.error("Error al procesar archivo:", error);
      res.status(500).json({ error: "Error al procesar el archivo" });
    }
  });

  // Ruta para distribuir los datos a sus respectivos módulos
  app.post("/api/importacion/distribuir", async (req, res) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const files = fs.readdirSync('uploads');
      const latestFile = files.sort().reverse()[0];

      if (!latestFile) {
        throw new Error("No se encontró el archivo de importación");
      }

      await workbook.xlsx.readFile(path.join('uploads', latestFile));
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error("No se pudo leer la hoja de cálculo");
      }

      const rows: any[] = [];
      let headers: string[] = [];

      // Leer los headers
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value?.toString().trim() || '');
      });

      console.log("Headers encontrados:", headers);

      // Procesar las filas
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            rowData[header] = cell.value;
          });
          rows.push(rowData);
        }
      });

      // Insertar datos en las tablas
      for (const row of rows) {
        try {
          console.log("Procesando fila:", row);

          // Extraer datos de la fila
          const codigoActivo = row['Código del Activo'] || row['CODIGO PRODUCTO'] || '';
          const cuentaContable = row['Cuenta Contable'] || row['CTA ACTIVO'] || '';
          const descripcion = row['Descripción'] || row['NOMBRE ACTIVO'] || '';
          const marca = row['Marca'] || row['MARCA'] || '';
          const modelo = row['Modelo'] || row['MODELO'] || '';
          const serie = row['N° Serie/Placa'] || row['SERIE'] || '';
          const porcentajeDepre = row['PORCT DEPRE'] || row['% Depreciación'] || 0;
          const costo = row['COSTO'] || row['Valor Histórico'] || 0;

          if (!codigoActivo || !descripcion) {
            console.log('Fila inválida, saltando:', row);
            continue;
          }

          // Verificar si el activo ya existe
          const activoExistente = await db.query.activos.findFirst({
            where: (activos, { eq }) => eq(activos.codigoActivo, codigoActivo)
          });

          let activoId;

          if (activoExistente) {
            // Si existe, actualizar
            const actualizacion = await db
              .update(activos)
              .set({
                cuentaContable,
                descripcion,
                marca: marca || null,
                modelo: modelo || null,
                numeroSerie: serie || null,
                updatedAt: new Date()
              })
              .where(eq(activos.id, activoExistente.id))
              .returning();
            activoId = actualizacion[0].id;
          } else {
            // Si no existe, crear nuevo
            const nuevoActivo = await db.insert(activos).values({
              codigoActivo,
              cuentaContable,
              descripcion,
              marca: marca || null,
              modelo: modelo || null,
              numeroSerie: serie || null,
              fechaAdquisicion: new Date(),
              fechaUso: new Date(),
              metodoAplicado: 'LINEAL',
              estado: 'ACTIVO'
            }).returning();
            activoId = nuevoActivo[0].id;
          }

          // Actualizar o crear depreciacion
          const depreciacionExistente = await db.query.depreciacion.findFirst({
            where: (depreciacion, { and, eq }) =>
              and(
                eq(depreciacion.activoId, activoId),
                eq(depreciacion.anio, new Date().getFullYear())
              )
          });

          if (!depreciacionExistente) {
            await db.insert(depreciacion).values({
              activoId,
              anio: new Date().getFullYear(),
              porcentajeDepreciacion: parseNumericValue(porcentajeDepre),
              depreciacionAcumuladaAnterior: '0',
              depreciacionEjercicio: '0',
              depreciacionRetiros: '0',
              depreciacionOtrosAjustes: '0',
              depreciacionAcumuladaHistorica: '0',
              ajustePorInflacionDepreciacion: '0',
              depreciacionAcumuladaAjustada: '0'
            });
          }

        } catch (error: any) {
          console.error('Error procesando fila:', row);
          console.error('Error detallado:', error.message);
          throw new Error(`Error procesando fila: ${error.message}`);
        }
      }

      res.json({ message: "Datos importados correctamente" });
    } catch (error: any) {
      console.error("Error al distribuir datos:", error);
      res.status(500).json({ error: "Error al distribuir los datos: " + error.message });
    }
  });

  // Ruta para exportar reportes
  app.get("/api/reportes/exportar", async (req, res) => {
    try {
      const tipo = req.query.tipo as string;
      const anio = req.query.anio as string;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte');

      // Obtener datos de la empresa
      const empresaData = await db.query.empresa.findMany({
        limit: 1,
        orderBy: (empresa, { desc }) => [desc(empresa.createdAt)],
      });
      const empresaInfo = empresaData[0];

      if (tipo === 'formato71') {
        // Consultar datos usando el ORM
        const activosData = await db.select().from(activos);
        const depreciacionData = await db.select({
          id: depreciacion.id,
          activoId: depreciacion.activoId,
          porcentajeDepreciacion: depreciacion.porcentajeDepreciacion,
          depreciacionAcumuladaAnterior: depreciacion.depreciacionAcumuladaAnterior,
          depreciacionEjercicio: depreciacion.depreciacionEjercicio,
          depreciacionRetiros: depreciacion.depreciacionRetiros,
          depreciacionOtrosAjustes: depreciacion.depreciacionOtrosAjustes,
          depreciacionAcumuladaHistorica: depreciacion.depreciacionAcumuladaHistorica,
          ajustePorInflacionDepreciacion: depreciacion.ajustePorInflacionDepreciacion,
          depreciacionAcumuladaAjustada: depreciacion.depreciacionAcumuladaAjustada,
          anio: depreciacion.anio
        }).from(depreciacion);

        // Combinar datos manualmente
        const datosCompletos = activosData.map(activo => {
          const depreciacionItem = depreciacionData.find(d =>
            d.activoId === activo.id && d.anio === parseInt(anio)
          );

          return {
            activo,
            depreciacion: depreciacionItem
          };
        });

        // Título del formato
        worksheet.getCell('A1').value = 'FORMATO 7.1: "REGISTRO DE ACTIVOS FIJOS - DETALLE DE LOS ACTIVOS FIJOS"';
        worksheet.mergeCells('A1:Y1');
        worksheet.getCell('A1').font = { bold: true };

        // Información de la empresa
        worksheet.getCell('A3').value = 'PERIODO:';
        worksheet.getCell('B3').value = anio;
        worksheet.getCell('A4').value = 'RUC:';
        worksheet.getCell('B4').value = empresaInfo?.ruc || '';
        worksheet.getCell('A5').value = 'APELLIDOS Y NOMBRES, DENOMINACIÓN O RAZÓN SOCIAL:';
        worksheet.getCell('B5').value = empresaInfo?.razonSocial || '';

        // Estilo para las etiquetas
        ['A3', 'A4', 'A5'].forEach(cell => {
          worksheet.getCell(cell).font = { bold: true };
        });

        // Espacio antes de la tabla
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Encabezados de columnas
        const headers = [
          // IDENTIFICACIÓN DEL ACTIVO FIJO
          'Código Relacionado',
          'Cuenta Contable',
          'Descripción',
          'Marca',
          'Modelo',
          'N° Serie/Placa',
          // DATOS DE LA DEPRECIACIÓN
          'Fecha de Adquisición',
          'Fecha de Inicio del Uso',
          'Método Aplicado',
          // DEPRECIACIÓN
          'Porcentaje de Depreciación',
          'Dep. Acumulada Anterior',
          'Dep. del Ejercicio',
          'Dep. Retiros/Bajas',
          'Dep. Otros Ajustes',
          'Dep. Acumulada Histórica',
          'Ajuste por Inflación',
          'Dep. Acumulada Ajustada'
        ];

        // Agregar encabezados
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        // Configurar anchos de columna
        worksheet.columns = headers.map(() => ({ width: 15 }));

        // Agregar datos
        datosCompletos.forEach(({ activo, depreciacion }) => {
          if (activo) {
            let formattedFechaAdq = '';
            let formattedFechaUso = '';

            try {
              if (activo.fechaAdquisicion) {
                const fechaAdq = new Date(activo.fechaAdquisicion);
                formattedFechaAdq = fechaAdq.toLocaleDateString('es-PE');
              }
              if (activo.fechaUso) {
                const fechaUso = new Date(activo.fechaUso);
                formattedFechaUso = fechaUso.toLocaleDateString('es-PE');
              }
            } catch (error) {
              console.error('Error formateando fechas:', error);
            }

            const row = worksheet.addRow([
              activo.codigoActivo,
              activo.cuentaContable,
              activo.descripcion,
              activo.marca || '',
              activo.modelo || '',
              activo.numeroSerie || '',
              formattedFechaAdq,
              formattedFechaUso,
              activo.metodoAplicado || '',
              parseFloat(depreciacion?.porcentajeDepreciacion?.toString() || '0').toFixed(2),
              parseFloat(depreciacion?.depreciacionAcumuladaAnterior?.toString() || '0').toFixed(2),
              parseFloat(depreciacion?.depreciacionEjercicio?.toString() || '0').toFixed(2),
              parseFloat(depreciacion?.depreciacionRetiros?.toString() || '0').toFixed(2),
              parseFloat(depreciacion?.depreciacionOtrosAjustes?.toString() || '0').toFixed(2),
              parseFloat(depreciacion?.depreciacionAcumuladaHistorica?.toString() || '0').toFixed(2),
              parseFloat(depreciacion?.ajustePorInflacionDepreciacion?.toString() || '0').toFixed(2),
              parseFloat(depreciacion?.depreciacionAcumuladaAjustada?.toString() || '0').toFixed(2),
            ]);

            // Aplicar estilos a la fila
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };

              // Alineación según el tipo de dato
              if (colNumber <= 9) {
                cell.alignment = { horizontal: 'left', vertical: 'middle' };
              } else {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
              }
            });
          }
        });
      } else if (tipo === 'resumen') {
        // Consultas separadas para reporte resumen
        const activosData = await db.select().from(activos);
        const depreciacionData = await db.select().from(depreciacion);

        worksheet.columns = [
          { header: 'Código', key: 'codigo' },
          { header: 'Descripción', key: 'descripcion' },
          { header: 'Valor Histórico', key: 'valorHistorico' },
          { header: 'Valor Ajustado', key: 'valorAjustado' },
          { header: 'Depreciación Acumulada', key: 'depreciacionAcumulada' },
          { header: 'Valor Neto', key: 'valorNeto' },
        ];

        activosData.forEach((activo) => {
          const depreciacionItem = depreciacionData.find(d => d.activoId === activo.id);

          // Assuming valorHistorico and valorAjustado are available elsewhere or need to be added.
          const valorHistorico = 0; // Replace with actual value retrieval
          const valorAjustado = 0; // Replace with actual value retrieval

          const depreciacionAcumulada = depreciacionItem ? parseFloat(depreciacionItem.depreciacionAcumuladaAjustada.toString()) : 0;
          const valorNeto = valorAjustado - depreciacionAcumulada;

          worksheet.addRow({
            codigo: activo.codigoActivo,
            descripcion: activo.descripcion,
            valorHistorico: valorHistorico.toFixed(2),
            valorAjustado: valorAjustado.toFixed(2),
            depreciacionAcumulada: depreciacionAcumulada.toFixed(2),
            valorNeto: valorNeto.toFixed(2),
          });
        });
      } else if (tipo === 'movimientos') {
        // This section needs significant modification or removal as movimientos table is gone.
        // Placeholder for potential future implementation.

      }


      // Configurar respuesta
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte-${tipo}-${anio}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error("Error al exportar reporte:", error);
      res.status(500).json({ error: "Error al exportar reporte" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

interface NewActivo {
  codigoActivo: string;
  cuentaContable: string;
  descripcion: string;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  fechaAdquisicion: Date;
  fechaUso: Date;
  metodoAplicado: string;
  estado: string;
  documentoAutorizacion?: string; // Added for consistency
}