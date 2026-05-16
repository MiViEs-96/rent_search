'use server';

import db from '@/lib/db';
import { geocode, getDistanceToNearest } from '@/lib/geo-service';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export async function postPropertyAction(formData: FormData) {
  try {
    const eircode = formData.get('eircode') as string;
    const rooms = parseInt(formData.get('rooms') as string) || 1;
    const bathrooms = parseInt(formData.get('bathrooms') as string) || 1;
    const garden = formData.get('garden') === 'on' ? 1 : 0;
    const parking = formData.get('parking') === 'on' ? 1 : 0;
    const ber = formData.get('ber') as string;
    const isApartment = formData.get('propertyType') === 'apartment' ? 1 : 0;
    const price = parseFloat(formData.get('price') as string) || 0;
    const availableFromDate = formData.get('availableFromDate') as string;
    const availableFromText = formData.get('availableFromText') as string;
    const availableFrom = availableFromDate || availableFromText || 'Non specificato';
    const description = formData.get('description') as string;
    const isAccessible = formData.get('isAccessible') === 'on' ? 1 : 0;
    let imageUrl = formData.get('imageUrl') as string;
    const imageFile = formData.get('imageFile') as File;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${imageFile.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    // Geocode
    const location = await geocode(eircode);
    if (!location) {
      return { success: false, error: 'Eircode non trovato. Per favore inserisci un Eircode valido.' };
    }

    // Enrich with distances (sequential to avoid overpass 429)
    const distHospital = await getDistanceToNearest(location.lat, location.lon, 'hospital');
    await new Promise(r => setTimeout(r, 500));
    const distTransport = await getDistanceToNearest(location.lat, location.lon, 'transport');
    await new Promise(r => setTimeout(r, 500));
    const distSupermarket = await getDistanceToNearest(location.lat, location.lon, 'supermarket');
    await new Promise(r => setTimeout(r, 500));
    const distSchool = await getDistanceToNearest(location.lat, location.lon, 'school');

    const stmt = db.prepare(`
      INSERT INTO properties (
        eircode, address, rooms, bathrooms, garden, parking, ber, is_apartment,
        price, available_from, description, is_accessible, image_url,
        lat, lon, dist_hospital, dist_transport, dist_supermarket, dist_school
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      eircode,
      location.display_name,
      rooms,
      bathrooms,
      garden,
      parking,
      ber,
      isApartment,
      price,
      availableFrom,
      description,
      isAccessible,
      imageUrl,
      location.lat,
      location.lon,
      distHospital,
      distTransport,
      distSupermarket,
      distSchool
    );

    revalidatePath('/results');
    return { success: true };
  } catch (err) {
    console.error('Error posting property:', err);
    return { success: false, error: 'Si è verificato un errore durante il salvataggio.' };
  }
}
