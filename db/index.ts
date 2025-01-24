import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@db/schema";

// Crear la conexión SQLite
const sqlite = new Database('sqlite.db');

// Exportar la instancia de la base de datos
export const db = drizzle(sqlite, { schema });

// Función para verificar la conexión
export async function validateConnection() {
  try {
    // Crear tablas si no existen
    const usersTableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sisevo_users';").get();

    if (!usersTableExists) {
      sqlite.exec(`
        CREATE TABLE sisevo_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'asistente' NOT NULL,
          nombre TEXT NOT NULL,
          email TEXT NOT NULL,
          empresa_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    const empresaTableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sisevo_empresa';").get();
    if (!empresaTableExists) {
      sqlite.exec(`
        CREATE TABLE sisevo_empresa (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ruc TEXT UNIQUE NOT NULL,
          razon_social TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    const activosTableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sisevo_activos';").get();
    if (!activosTableExists) {
      sqlite.exec(`
        CREATE TABLE sisevo_activos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_activo TEXT NOT NULL,
          cuenta_contable TEXT DEFAULT '33',
          descripcion TEXT NOT NULL,
          marca TEXT,
          modelo TEXT,
          numero_serie TEXT,
          fecha_adquisicion TEXT DEFAULT CURRENT_TIMESTAMP,
          fecha_uso TEXT DEFAULT CURRENT_TIMESTAMP,
          metodo_aplicado TEXT DEFAULT 'LINEAL',
          estado TEXT DEFAULT 'ACTIVO',
          empresa_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    const depreciacionTableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sisevo_depreciacion';").get();
    if (!depreciacionTableExists) {
      sqlite.exec(`
        CREATE TABLE sisevo_depreciacion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activo_id INTEGER NOT NULL,
          anio INTEGER NOT NULL,
          porcentaje_depreciacion TEXT NOT NULL,
          depreciacion_acumulada_anterior TEXT NOT NULL,
          depreciacion_ejercicio TEXT NOT NULL,
          depreciacion_retiros TEXT DEFAULT '0',
          depreciacion_otros_ajustes TEXT DEFAULT '0',
          depreciacion_acumulada_historica TEXT NOT NULL,
          ajuste_por_inflacion_depreciacion TEXT DEFAULT '0',
          depreciacion_acumulada_ajustada TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Test query
    const testResult = sqlite.prepare('SELECT 1 AS test').get();
    if (!testResult) {
      throw new Error("Test query failed. Database may be corrupt.");
    }

    console.log('✅ Conexión a la base de datos SQLite exitosa');
    console.log('✅ Tablas creadas/verificadas');
    return true;
  } catch (err) {
    console.error('❌ Error de conexión a la base de datos:', err);
    throw err;
  }
}