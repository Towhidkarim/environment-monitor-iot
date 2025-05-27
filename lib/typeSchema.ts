import { z } from 'zod';

export const SensorReadingsRawSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  heat_index: z.number(),
  mq8_value: z.number(),
});
