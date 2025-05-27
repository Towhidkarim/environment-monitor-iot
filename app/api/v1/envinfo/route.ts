import { db } from '@/db/db';
import { sensor_readings_table } from '@/db/schema';
import { SensorReadingsRawSchema } from '@/lib/typeSchema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { desc } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsedData = SensorReadingsRawSchema.safeParse(data);
    console.log(parsedData.data);
    if (!parsedData.success)
      return NextResponse.json({ message: 'Invalid Values' }, { status: 400 });

    await db.insert(sensor_readings_table).values({
      reading_id: nanoid(),
      heatIndex: parsedData.data.heat_index,
      humidity: parsedData.data.humidity,
      mq_reading: parsedData.data.mq8_value,
      temperature: parsedData.data.temperature,
      timestamp: Date.now(),
    });

    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const data = await db
      .select()
      .from(sensor_readings_table)
      .orderBy(desc(sensor_readings_table.timestamp))
      .limit(1);
    return Response.json({ data }, { status: 200 });
  } catch (error) {}
  return Response.json({ data: 'Something Went Wrong' }, { status: 400 });
}
