'use server';

import { db } from '@/db/db';
import { sensor_readings_table } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default async function GetSensorDataAction(dataCount: number = 1) {
  try {
    const count = dataCount > 5 ? 5 : dataCount;
    const data = await db
      .select()
      .from(sensor_readings_table)
      .orderBy(desc(sensor_readings_table.timestamp))
      .limit(count);

    return data;
  } catch (error) {
    return [];
  }
}
