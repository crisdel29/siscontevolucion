import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Enumeración de roles
export const UserRole = {
  ADMIN: 'admin',
  EMPRESA: 'empresa',
  ASISTENTE: 'asistente'
} as const;

// Tabla de usuarios
export const users = sqliteTable("sisevo_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default(UserRole.ASISTENTE),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  empresaId: integer("empresa_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Tabla de empresa
export const empresa = sqliteTable("sisevo_empresa", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ruc: text("ruc").unique().notNull(),
  razonSocial: text("razon_social").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Tabla de activos
export const activos = sqliteTable("sisevo_activos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigoActivo: text("codigo_activo").notNull(),
  cuentaContable: text("cuenta_contable").default("33"),
  descripcion: text("descripcion").notNull(),
  marca: text("marca"),
  modelo: text("modelo"),
  numeroSerie: text("numero_serie"),
  fechaAdquisicion: text("fecha_adquisicion").default(sql`CURRENT_TIMESTAMP`),
  fechaUso: text("fecha_uso").default(sql`CURRENT_TIMESTAMP`),
  metodoAplicado: text("metodo_aplicado").default("LINEAL"),
  estado: text("estado").default("ACTIVO"),
  empresaId: integer("empresa_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Tabla de depreciación
export const depreciacion = sqliteTable("sisevo_depreciacion", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activoId: integer("activo_id").notNull(),
  anio: integer("anio").notNull(),
  porcentajeDepreciacion: text("porcentaje_depreciacion").notNull(),
  depreciacionAcumuladaAnterior: text("depreciacion_acumulada_anterior").notNull(),
  depreciacionEjercicio: text("depreciacion_ejercicio").notNull(),
  depreciacionRetiros: text("depreciacion_retiros").default("0"),
  depreciacionOtrosAjustes: text("depreciacion_otros_ajustes").default("0"),
  depreciacionAcumuladaHistorica: text("depreciacion_acumulada_historica").notNull(),
  ajustePorInflacionDepreciacion: text("ajuste_por_inflacion_depreciacion").default("0"),
  depreciacionAcumuladaAjustada: text("depreciacion_acumulada_ajustada").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Relaciones
export const userRelations = relations(users, ({ one }) => ({
  empresa: one(empresa, {
    fields: [users.empresaId],
    references: [empresa.id],
  }),
}));

export const activosRelations = relations(activos, ({ one }) => ({
  empresa: one(empresa, {
    fields: [activos.empresaId],
    references: [empresa.id],
  }),
}));

export const depreciacionRelations = relations(depreciacion, ({ one }) => ({
  activo: one(activos, {
    fields: [depreciacion.activoId],
    references: [activos.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Empresa = typeof empresa.$inferSelect;
export type NewEmpresa = typeof empresa.$inferInsert;
export type Activo = typeof activos.$inferSelect;
export type NewActivo = typeof activos.$inferInsert;
export type Depreciacion = typeof depreciacion.$inferSelect;
export type NewDepreciacion = typeof depreciacion.$inferInsert;