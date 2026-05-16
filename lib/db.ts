import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'versatemple.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eircode TEXT NOT NULL,
    address TEXT,
    rooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    garden BOOLEAN DEFAULT 0,
    parking BOOLEAN DEFAULT 0,
    ber TEXT,
    is_apartment BOOLEAN DEFAULT 0,
    price REAL NOT NULL,
    available_from TEXT,
    description TEXT,
    is_accessible BOOLEAN DEFAULT 0,
    image_url TEXT,
    lat REAL,
    lon REAL,
    dist_hospital REAL,
    dist_transport REAL,
    dist_supermarket REAL,
    dist_school REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;

export interface PropertyRecord {
  id: number;
  eircode: string;
  address?: string;
  rooms: number;
  bathrooms: number;
  garden: number; // SQLite uses 0/1
  parking: number;
  ber: string;
  is_apartment: number;
  price: number;
  available_from: string;
  description: string;
  is_accessible: number;
  image_url: string;
  lat: number;
  lon: number;
  dist_hospital: number;
  dist_transport: number;
  dist_supermarket: number;
  dist_school: number;
  created_at: string;
}
