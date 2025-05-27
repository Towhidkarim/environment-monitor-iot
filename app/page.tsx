import IoTDashboard from '@/components/IoTDashboard';
import GetSensorDataAction from '@/lib/actions';
import Image from 'next/image';

export default async function Home() {
  const sensorReadings = await GetSensorDataAction(1);
  if (sensorReadings.length === 0) return <h1>No Data Found</h1>;
  return (
    <main>
      <IoTDashboard readings={sensorReadings[0]} />
    </main>
  );
}
