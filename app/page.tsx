import IoTDashboard from '@/components/IoTDashboard';
import GetSensorDataAction from '@/lib/actions';
import { Redis } from '@upstash/redis';

export default async function Home() {
  const sensorReadings = await GetSensorDataAction(1);
  if (sensorReadings.length === 0) return <h1>No Data Found</h1>;
  const redisClient = Redis.fromEnv();
  const dataEndpoint = (await redisClient.get('data_endpoint')) as string;
  console.log(dataEndpoint);
  return (
    <main>
      <IoTDashboard
        readings={sensorReadings[0]}
        defaultEndpoint={dataEndpoint}
      />
    </main>
  );
}
