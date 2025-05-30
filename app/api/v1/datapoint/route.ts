import { Redis } from '@upstash/redis';

export async function POST(request: Request) {
  try {
    const redisClient = Redis.fromEnv();

    const data = await request.json();
    const endpoint = data['data_endpoint'];
    console.log(endpoint);
    await redisClient.set('data-endpoint', endpoint);

    return Response.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return Response.json({ message: 'Invalid JSON' }, { status: 400 });
  }
}
