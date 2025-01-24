var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import * as dotenv2 from "dotenv";
import path3 from "path";
import express from "express";

// server/routes.ts
import { createServer } from "http";

// db/index.ts
import * as dotenv from "dotenv";
import path from "path";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  UserRole: () => UserRole,
  activos: () => activos,
  activosRelations: () => activosRelations,
  depreciacion: () => depreciacion,
  depreciacionRelations: () => depreciacionRelations,
  empresa: () => empresa,
  insertUserSchema: () => insertUserSchema,
  selectUserSchema: () => selectUserSchema,
  userRelations: () => userRelations,
  users: () => users
});
import { mysqlTable, varchar, int, timestamp, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var UserRole = {
  ADMIN: "admin",
  EMPRESA: "empresa",
  ASISTENTE: "asistente"
};
var users = mysqlTable("sisevo_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default(UserRole.ASISTENTE),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  empresaId: int("empresa_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});
var empresa = mysqlTable("sisevo_empresa", {
  id: int("id").autoincrement().primaryKey(),
  ruc: varchar("ruc", { length: 20 }).unique().notNull(),
  razonSocial: varchar("razon_social", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});
var activos = mysqlTable("sisevo_activos", {
  id: int("id").autoincrement().primaryKey(),
  codigoActivo: varchar("codigo_activo", { length: 50 }).notNull(),
  cuentaContable: varchar("cuenta_contable", { length: 20 }).default("33"),
  descripcion: varchar("descripcion", { length: 1e3 }).notNull(),
  marca: varchar("marca", { length: 100 }),
  modelo: varchar("modelo", { length: 100 }),
  numeroSerie: varchar("numero_serie", { length: 100 }),
  fechaAdquisicion: timestamp("fecha_adquisicion").defaultNow(),
  fechaUso: timestamp("fecha_uso").defaultNow(),
  metodoAplicado: varchar("metodo_aplicado", { length: 50 }).default("LINEAL"),
  estado: varchar("estado", { length: 20 }).default("ACTIVO"),
  empresaId: int("empresa_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});
var depreciacion = mysqlTable("sisevo_depreciacion", {
  id: int("id").autoincrement().primaryKey(),
  activoId: int("activo_id").notNull(),
  anio: int("anio").notNull(),
  porcentajeDepreciacion: decimal("porcentaje_depreciacion", { precision: 5, scale: 2 }).notNull(),
  depreciacionAcumuladaAnterior: decimal("depreciacion_acumulada_anterior", { precision: 15, scale: 2 }).notNull(),
  depreciacionEjercicio: decimal("depreciacion_ejercicio", { precision: 15, scale: 2 }).notNull(),
  depreciacionRetiros: decimal("depreciacion_retiros", { precision: 15, scale: 2 }).default("0"),
  depreciacionOtrosAjustes: decimal("depreciacion_otros_ajustes", { precision: 15, scale: 2 }).default("0"),
  depreciacionAcumuladaHistorica: decimal("depreciacion_acumulada_historica", { precision: 15, scale: 2 }).notNull(),
  ajustePorInflacionDepreciacion: decimal("ajuste_por_inflacion_depreciacion", { precision: 15, scale: 2 }).default("0"),
  depreciacionAcumuladaAjustada: decimal("depreciacion_acumulada_ajustada", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});
var userRelations = relations(users, ({ one }) => ({
  empresa: one(empresa, {
    fields: [users.empresaId],
    references: [empresa.id]
  })
}));
var activosRelations = relations(activos, ({ one }) => ({
  empresa: one(empresa, {
    fields: [activos.empresaId],
    references: [empresa.id]
  })
}));
var depreciacionRelations = relations(depreciacion, ({ one }) => ({
  activo: one(activos, {
    fields: [depreciacion.activoId],
    references: [activos.id]
  })
}));
var insertUserSchema = createInsertSchema(users);
var selectUserSchema = createSelectSchema(users);

// db/index.ts
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error("Faltan variables de entorno necesarias para la conexi\xF3n a la base de datos");
}
var dbConfig = {
  host: "69.46.7.42",
  // Forzar el uso del host remoto
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  ssl: false,
  // Deshabilitamos SSL ya que el servidor no lo soporta
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};
console.log("Intentando conectar a la base de datos con configuraci\xF3n:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: "Deshabilitado",
  mode: process.env.NODE_ENV
});
var pool = mysql.createPool(dbConfig);
var db = drizzle(pool, { mode: "default", schema: schema_exports });
async function validateConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log("\u2705 Conexi\xF3n a la base de datos exitosa");
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Mode: ${process.env.NODE_ENV}`);
    connection.release();
    return true;
  } catch (err) {
    console.error("\u274C Error de conexi\xF3n a la base de datos:", err);
    throw err;
  }
}
validateConnection().catch((err) => {
  console.error("Error al establecer la conexi\xF3n inicial:", err);
});

// server/routes.ts
import { eq } from "drizzle-orm";
import bcrypt2 from "bcrypt";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import createMemoryStore from "memorystore";
import bcrypt from "bcrypt";
function setupAuth(app2) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "siscontevolucion-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 horas
    },
    store: new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    })
  };
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: (users3, { eq: eq2 }) => eq2(users3.username, username)
        });
        if (!user) {
          return done(null, false, { message: "Usuario o contrase\xF1a incorrectos" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Usuario o contrase\xF1a incorrectos" });
        }
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (err) {
        console.error("Error en autenticaci\xF3n:", err);
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: (users3, { eq: eq2 }) => eq2(users3.id, id)
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).send(info.message ?? "Error de inicio de sesi\xF3n");
      }
      req.logIn(user, (err2) => {
        if (err2) {
          return next(err2);
        }
        return res.json({
          message: "Inicio de sesi\xF3n exitoso",
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            nombre: user.nombre,
            email: user.email
          }
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Error al cerrar sesi\xF3n");
      }
      res.json({ message: "Sesi\xF3n cerrada correctamente" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        nombre: user.nombre,
        email: user.email
      });
    }
    res.status(401).send("No ha iniciado sesi\xF3n");
  });
}

// server/routes.ts
import ExcelJS from "exceljs";
import multer from "multer";
import path2 from "path";
import fs from "fs";
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
var upload = multer({ storage });
function parseNumericValue(value) {
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    const numericValue = value.replace(/[^0-9.-]/g, "");
    return numericValue || "0";
  }
  if (value instanceof Date) {
    return "0";
  }
  return "0";
}
function registerRoutes(app2) {
  setupAuth(app2);
  app2.post("/api/admin/setup", async (req, res) => {
    try {
      const adminPassword = "Admin2024@";
      const hashedPassword = await bcrypt2.hash(adminPassword, 10);
      const existingAdmin = await db.query.users.findFirst({
        where: (users3, { eq: eq2 }) => eq2(users3.username, "admin")
      });
      if (existingAdmin) {
        return res.json({ message: "Usuario administrador ya existe" });
      }
      const newAdmin = {
        username: "admin",
        password: hashedPassword,
        role: UserRole.ADMIN,
        nombre: "Administrador Principal",
        email: "admin@siscontevolucion.com"
      };
      const result = await db.insert(users).values(newAdmin);
      const { password: _, ...adminData } = newAdmin;
      res.json({ message: "Usuario administrador creado con \xE9xito", user: adminData });
    } catch (error) {
      console.error("Error al crear usuario admin:", error);
      res.status(500).json({ error: "Error al crear usuario administrador" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No ha iniciado sesi\xF3n");
      }
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).send("No tiene permisos para acceder a este recurso");
      }
      const results = await db.query.users.findMany({
        orderBy: (users3, { asc }) => [asc(users3.username)]
      });
      const safeUsers = results.map(({ password, ...user2 }) => user2);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });
  app2.get("/api/empresa", async (_req, res) => {
    try {
      const results = await db.query.empresa.findMany({
        limit: 1,
        orderBy: (empresa2, { desc }) => [desc(empresa2.createdAt)]
      });
      res.json(results[0] || null);
    } catch (error) {
      console.error("Error al obtener empresa:", error);
      res.status(500).json({ error: "Error al obtener datos de la empresa" });
    }
  });
  app2.post("/api/empresa", async (req, res) => {
    try {
      const { ruc, razonSocial } = req.body;
      if (!ruc || !razonSocial) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }
      const empresaExistente = await db.query.empresa.findFirst();
      if (empresaExistente) {
        const result2 = await db.update(empresa).set({
          ruc,
          razonSocial,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(empresa.id, empresaExistente.id)).returning();
        return res.json(result2[0]);
      }
      const result = await db.insert(empresa).values({
        ruc,
        razonSocial
      }).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error al guardar empresa:", error);
      res.status(500).json({ error: "Error al guardar datos de la empresa" });
    }
  });
  app2.get("/api/activos", async (req, res) => {
    try {
      const a\u00F1o = req.query.a\u00F1o ? parseInt(req.query.a\u00F1o) : void 0;
      const results = await db.query.activos.findMany({
        orderBy: (activos2, { asc }) => [asc(activos2.codigoActivo)],
        where: a\u00F1o ? (activos2, { and, eq: eq2, sql }) => and(eq2(sql`EXTRACT(YEAR FROM ${activos2.fechaUso})`, a\u00F1o)) : void 0
      });
      res.json(results);
    } catch (error) {
      console.error("Error al obtener activos:", error);
      res.status(500).json({ error: "Error al obtener activos" });
    }
  });
  app2.post("/api/activos", async (req, res) => {
    try {
      const nuevoActivo = {
        codigoActivo: req.body.codigoActivo,
        cuentaContable: req.body.cuentaContable,
        descripcion: req.body.descripcion,
        marca: req.body.marca || null,
        modelo: req.body.modelo || null,
        numeroSerie: req.body.numeroSerie || null,
        fechaAdquisicion: new Date(req.body.fechaAdquisicion),
        fechaUso: new Date(req.body.fechaUso),
        metodoAplicado: req.body.metodoAplicado,
        estado: req.body.estado || "ACTIVO"
      };
      const result = await db.insert(activos).values(nuevoActivo).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error al crear activo:", error);
      res.status(500).json({ error: "Error al crear activo" });
    }
  });
  app2.put("/api/activos/:id", async (req, res) => {
    try {
      const result = await db.update(activos).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq(activos.id, parseInt(req.params.id))).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error al actualizar activo:", error);
      res.status(500).json({ error: "Error al actualizar activo" });
    }
  });
  app2.post("/api/importacion/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        throw new Error("No se encontr\xF3 ning\xFAn archivo");
      }
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error("No se pudo leer la hoja de c\xE1lculo");
      }
      const preview = [];
      let headers = [];
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value?.toString() || "");
      });
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData = {};
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
  app2.post("/api/importacion/distribuir", async (req, res) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const files = fs.readdirSync("uploads");
      const latestFile = files.sort().reverse()[0];
      if (!latestFile) {
        throw new Error("No se encontr\xF3 el archivo de importaci\xF3n");
      }
      await workbook.xlsx.readFile(path2.join("uploads", latestFile));
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error("No se pudo leer la hoja de c\xE1lculo");
      }
      const rows = [];
      let headers = [];
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value?.toString().trim() || "");
      });
      console.log("Headers encontrados:", headers);
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            rowData[header] = cell.value;
          });
          rows.push(rowData);
        }
      });
      for (const row of rows) {
        try {
          console.log("Procesando fila:", row);
          const codigoActivo = row["C\xF3digo del Activo"] || row["CODIGO PRODUCTO"] || "";
          const cuentaContable = row["Cuenta Contable"] || row["CTA ACTIVO"] || "";
          const descripcion = row["Descripci\xF3n"] || row["NOMBRE ACTIVO"] || "";
          const marca = row["Marca"] || row["MARCA"] || "";
          const modelo = row["Modelo"] || row["MODELO"] || "";
          const serie = row["N\xB0 Serie/Placa"] || row["SERIE"] || "";
          const porcentajeDepre = row["PORCT DEPRE"] || row["% Depreciaci\xF3n"] || 0;
          const costo = row["COSTO"] || row["Valor Hist\xF3rico"] || 0;
          if (!codigoActivo || !descripcion) {
            console.log("Fila inv\xE1lida, saltando:", row);
            continue;
          }
          const activoExistente = await db.query.activos.findFirst({
            where: (activos2, { eq: eq2 }) => eq2(activos2.codigoActivo, codigoActivo)
          });
          let activoId;
          if (activoExistente) {
            const actualizacion = await db.update(activos).set({
              cuentaContable,
              descripcion,
              marca: marca || null,
              modelo: modelo || null,
              numeroSerie: serie || null,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(activos.id, activoExistente.id)).returning();
            activoId = actualizacion[0].id;
          } else {
            const nuevoActivo = await db.insert(activos).values({
              codigoActivo,
              cuentaContable,
              descripcion,
              marca: marca || null,
              modelo: modelo || null,
              numeroSerie: serie || null,
              fechaAdquisicion: /* @__PURE__ */ new Date(),
              fechaUso: /* @__PURE__ */ new Date(),
              metodoAplicado: "LINEAL",
              estado: "ACTIVO"
            }).returning();
            activoId = nuevoActivo[0].id;
          }
          const depreciacionExistente = await db.query.depreciacion.findFirst({
            where: (depreciacion2, { and, eq: eq2 }) => and(
              eq2(depreciacion2.activoId, activoId),
              eq2(depreciacion2.anio, (/* @__PURE__ */ new Date()).getFullYear())
            )
          });
          if (!depreciacionExistente) {
            await db.insert(depreciacion).values({
              activoId,
              anio: (/* @__PURE__ */ new Date()).getFullYear(),
              porcentajeDepreciacion: parseNumericValue(porcentajeDepre),
              depreciacionAcumuladaAnterior: "0",
              depreciacionEjercicio: "0",
              depreciacionRetiros: "0",
              depreciacionOtrosAjustes: "0",
              depreciacionAcumuladaHistorica: "0",
              ajustePorInflacionDepreciacion: "0",
              depreciacionAcumuladaAjustada: "0"
            });
          }
        } catch (error) {
          console.error("Error procesando fila:", row);
          console.error("Error detallado:", error.message);
          throw new Error(`Error procesando fila: ${error.message}`);
        }
      }
      res.json({ message: "Datos importados correctamente" });
    } catch (error) {
      console.error("Error al distribuir datos:", error);
      res.status(500).json({ error: "Error al distribuir los datos: " + error.message });
    }
  });
  app2.get("/api/reportes/exportar", async (req, res) => {
    try {
      const tipo = req.query.tipo;
      const anio = req.query.anio;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Reporte");
      const empresaData = await db.query.empresa.findMany({
        limit: 1,
        orderBy: (empresa2, { desc }) => [desc(empresa2.createdAt)]
      });
      const empresaInfo = empresaData[0];
      if (tipo === "formato71") {
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
        const datosCompletos = activosData.map((activo) => {
          const depreciacionItem = depreciacionData.find(
            (d) => d.activoId === activo.id && d.anio === parseInt(anio)
          );
          return {
            activo,
            depreciacion: depreciacionItem
          };
        });
        worksheet.getCell("A1").value = 'FORMATO 7.1: "REGISTRO DE ACTIVOS FIJOS - DETALLE DE LOS ACTIVOS FIJOS"';
        worksheet.mergeCells("A1:Y1");
        worksheet.getCell("A1").font = { bold: true };
        worksheet.getCell("A3").value = "PERIODO:";
        worksheet.getCell("B3").value = anio;
        worksheet.getCell("A4").value = "RUC:";
        worksheet.getCell("B4").value = empresaInfo?.ruc || "";
        worksheet.getCell("A5").value = "APELLIDOS Y NOMBRES, DENOMINACI\xD3N O RAZ\xD3N SOCIAL:";
        worksheet.getCell("B5").value = empresaInfo?.razonSocial || "";
        ["A3", "A4", "A5"].forEach((cell) => {
          worksheet.getCell(cell).font = { bold: true };
        });
        worksheet.addRow([]);
        worksheet.addRow([]);
        const headers = [
          // IDENTIFICACIÓN DEL ACTIVO FIJO
          "C\xF3digo Relacionado",
          "Cuenta Contable",
          "Descripci\xF3n",
          "Marca",
          "Modelo",
          "N\xB0 Serie/Placa",
          // DATOS DE LA DEPRECIACIÓN
          "Fecha de Adquisici\xF3n",
          "Fecha de Inicio del Uso",
          "M\xE9todo Aplicado",
          // DEPRECIACIÓN
          "Porcentaje de Depreciaci\xF3n",
          "Dep. Acumulada Anterior",
          "Dep. del Ejercicio",
          "Dep. Retiros/Bajas",
          "Dep. Otros Ajustes",
          "Dep. Acumulada Hist\xF3rica",
          "Ajuste por Inflaci\xF3n",
          "Dep. Acumulada Ajustada"
        ];
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        worksheet.columns = headers.map(() => ({ width: 15 }));
        datosCompletos.forEach(({ activo, depreciacion: depreciacion2 }) => {
          if (activo) {
            let formattedFechaAdq = "";
            let formattedFechaUso = "";
            try {
              if (activo.fechaAdquisicion) {
                const fechaAdq = new Date(activo.fechaAdquisicion);
                formattedFechaAdq = fechaAdq.toLocaleDateString("es-PE");
              }
              if (activo.fechaUso) {
                const fechaUso = new Date(activo.fechaUso);
                formattedFechaUso = fechaUso.toLocaleDateString("es-PE");
              }
            } catch (error) {
              console.error("Error formateando fechas:", error);
            }
            const row = worksheet.addRow([
              activo.codigoActivo,
              activo.cuentaContable,
              activo.descripcion,
              activo.marca || "",
              activo.modelo || "",
              activo.numeroSerie || "",
              formattedFechaAdq,
              formattedFechaUso,
              activo.metodoAplicado || "",
              parseFloat(depreciacion2?.porcentajeDepreciacion?.toString() || "0").toFixed(2),
              parseFloat(depreciacion2?.depreciacionAcumuladaAnterior?.toString() || "0").toFixed(2),
              parseFloat(depreciacion2?.depreciacionEjercicio?.toString() || "0").toFixed(2),
              parseFloat(depreciacion2?.depreciacionRetiros?.toString() || "0").toFixed(2),
              parseFloat(depreciacion2?.depreciacionOtrosAjustes?.toString() || "0").toFixed(2),
              parseFloat(depreciacion2?.depreciacionAcumuladaHistorica?.toString() || "0").toFixed(2),
              parseFloat(depreciacion2?.ajustePorInflacionDepreciacion?.toString() || "0").toFixed(2),
              parseFloat(depreciacion2?.depreciacionAcumuladaAjustada?.toString() || "0").toFixed(2)
            ]);
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
              };
              if (colNumber <= 9) {
                cell.alignment = { horizontal: "left", vertical: "middle" };
              } else {
                cell.alignment = { horizontal: "right", vertical: "middle" };
              }
            });
          }
        });
      } else if (tipo === "resumen") {
        const activosData = await db.select().from(activos);
        const depreciacionData = await db.select().from(depreciacion);
        worksheet.columns = [
          { header: "C\xF3digo", key: "codigo" },
          { header: "Descripci\xF3n", key: "descripcion" },
          { header: "Valor Hist\xF3rico", key: "valorHistorico" },
          { header: "Valor Ajustado", key: "valorAjustado" },
          { header: "Depreciaci\xF3n Acumulada", key: "depreciacionAcumulada" },
          { header: "Valor Neto", key: "valorNeto" }
        ];
        activosData.forEach((activo) => {
          const depreciacionItem = depreciacionData.find((d) => d.activoId === activo.id);
          const valorHistorico = 0;
          const valorAjustado = 0;
          const depreciacionAcumulada = depreciacionItem ? parseFloat(depreciacionItem.depreciacionAcumuladaAjustada.toString()) : 0;
          const valorNeto = valorAjustado - depreciacionAcumulada;
          worksheet.addRow({
            codigo: activo.codigoActivo,
            descripcion: activo.descripcion,
            valorHistorico: valorHistorico.toFixed(2),
            valorAjustado: valorAjustado.toFixed(2),
            depreciacionAcumulada: depreciacionAcumulada.toFixed(2),
            valorNeto: valorNeto.toFixed(2)
          });
        });
      } else if (tipo === "movimientos") {
      }
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=reporte-${tipo}-${anio}.xlsx`
      );
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error al exportar reporte:", error);
      res.status(500).json({ error: "Error al exportar reporte" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
if (process.env.NODE_ENV === "production") {
  dotenv2.config({ path: path3.resolve(process.cwd(), ".env.production") });
} else {
  dotenv2.config({ path: path3.resolve(process.cwd(), ".env") });
}
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.url}`);
  next();
});
async function startServer() {
  try {
    await validateConnection();
    console.log("\u2705 Base de datos conectada");
    const server = registerRoutes(app);
    const distPath = path3.resolve(process.cwd(), "dist/public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path3.join(distPath, "index.html"));
    });
    const PORT = process.env.PORT || 5e3;
    server.listen(PORT, () => {
      console.log(`\u2705 Servidor iniciado en puerto ${PORT}`);
      console.log(`   Modo: ${process.env.NODE_ENV}`);
      console.log(`   Base de datos: ${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error("\u274C Error fatal:", error);
    process.exit(1);
  }
}
startServer();
