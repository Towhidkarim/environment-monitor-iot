import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sensor_readings_table = sqliteTable('sensor_reasongs', {
  reading_id: text('reading_id').primaryKey().notNull(),
  temperature: real('temperature'),
  humidity: real('humidity'),
  heatIndex: real('heatIndex'),
  mq_reading: real('mq_reading'),
  timestamp: integer('timestamp'),
});

export type TSensor_readings = typeof sensor_readings_table.$inferSelect;
