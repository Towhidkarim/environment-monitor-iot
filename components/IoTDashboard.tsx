'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TSensor_readings } from '@/db/schema';
import GetSensorDataAction from '@/lib/actions';

// Mock data - replace with your actual API calls
const mockSensorData = {
  temperature: {
    value: 24.5,
    unit: '°C',
    status: 'normal',
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  },
  humidity: {
    value: 65,
    unit: '%',
    status: 'normal',
    lastUpdated: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
  },
  heatIndex: {
    value: 26.8,
    unit: '°C',
    status: 'caution',
    lastUpdated: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
  },
  airQuality: {
    value: 42,
    unit: 'AQI',
    status: 'good',
    category: 'Good',
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
};

export default function IoTDashboard({
  readings,
  defaultEndpoint,
}: {
  readings: TSensor_readings;
  defaultEndpoint: string;
}) {
  const [customEndpoint, setCustomEndpoint] = useState<string>(defaultEndpoint);
  const [showEndpointInput, setShowEndpointInput] = useState(false);

  const baseData = {
    temperature: {
      value: readings.temperature ?? 26,
      unit: '°C',
      status: 'normal',
      lastUpdated: new Date(readings.timestamp ?? Date.now()),
    },
    humidity: {
      value: readings.humidity ?? 65,
      unit: '%',
      status: 'normal',
      lastUpdated: new Date(readings.timestamp ?? Date.now()), // minutes ago
    },
    heatIndex: {
      value: readings.heatIndex ?? 28,
      unit: '°C',
      status: 'caution',
      lastUpdated: new Date(readings.timestamp ?? Date.now()), // minute ago
    },
    airQuality: {
      value: readings.mq_reading ?? 40,
      unit: 'AQI',
      status: 'good',
      category: 'Good',
      lastUpdated: new Date(readings.timestamp ?? Date.now()), // minutes ago
    },
  };
  const [sensorData, setSensorData] = useState(baseData);
  const [isBTConnected, setIsBTConnected] = useState(true);
  const [status, setStatus] = useState('Connected');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const getSetReadings = async () => {
      let sensorData: TSensor_readings[] | undefined;

      try {
        if (customEndpoint) {
          // Fetch from custom endpoint
          const response = await fetch(customEndpoint);
          console.log(response);
          if (!response.ok) {
            throw new Error('Failed to fetch from custom endpoint');
          }
          const data: TSensor_readings = await response.json();
          sensorData = [data]; // Wrap in array to match database format
        } else {
          // Fetch from database
          sensorData = await GetSensorDataAction(1);
        }

        if (!sensorData || sensorData.length === 0) return;

        setSensorData((prev) => ({
          temperature: {
            ...prev.temperature,
            value: sensorData?.[0].temperature ?? 25,
            lastUpdated: new Date(),
          },
          humidity: {
            ...prev.humidity,
            value: sensorData?.[0].humidity ?? 65,
            lastUpdated: new Date(),
          },
          heatIndex: {
            ...prev.heatIndex,
            value: sensorData?.[0].heatIndex ?? 26.8,
            lastUpdated: new Date(),
          },
          airQuality: {
            ...prev.airQuality,
            value: sensorData?.[0].mq_reading ?? 42,
            lastUpdated: new Date(),
          },
        }));
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        // Optionally handle the error in the UI
      }
    };

    getSetReadings(); // Initial fetch
    const interval = setInterval(getSetReadings, 2000); // Update every 40 seconds

    return () => clearInterval(interval);
  }, [customEndpoint]); // Add customEndpoint as dependency

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'normal':
        return 'bg-blue-500';
      case 'caution':
        return 'bg-yellow-500';
      case 'warning':
        return 'bg-orange-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 50)
      return { status: 'good', category: 'Good', color: 'bg-green-500' };
    if (aqi <= 100)
      return {
        status: 'moderate',
        category: 'Moderate',
        color: 'bg-yellow-500',
      };
    if (aqi <= 150)
      return {
        status: 'unhealthy-sensitive',
        category: 'Unhealthy for Sensitive Groups',
        color: 'bg-orange-500',
      };
    if (aqi <= 200)
      return {
        status: 'unhealthy',
        category: 'Unhealthy',
        color: 'bg-red-500',
      };
    if (aqi <= 300)
      return {
        status: 'very-unhealthy',
        category: 'Very Unhealthy',
        color: 'bg-purple-500',
      };
    return { status: 'hazardous', category: 'Hazardous', color: 'bg-red-800' };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  const refreshData = async () => {
    // Simulate API call
    setLastRefresh(new Date());
    // In real implementation, fetch from your API here
  };

  const airQualityInfo = getAirQualityStatus(sensorData.airQuality.value);

  return (
    <div className='bg-gradient-to-br from-blue-50 dark:from-gray-900 via-indigo-50 dark:via-blue-900 to-purple-50 dark:to-indigo-900 min-h-screen'>
      <div className='mx-auto px-4 py-8 container'>
        {/* Header */}
        <div className='flex md:flex-row flex-col justify-between items-center mb-8'>
          <div className='my-2'>
            <h1 className='mb-2 font-bold text-gray-900 dark:text-white text-3xl md:text-4xl'>
              IoT Sensor Dashboard
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              Real-time environmental monitoring
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              {isBTConnected ? (
                <Wifi className='w-5 h-5 text-green-500' />
              ) : (
                <WifiOff className='w-5 h-5 text-red-500' />
              )}
              <span className='text-gray-600 dark:text-gray-300 text-sm'>
                {isBTConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button
              onClick={() => setShowEndpointInput(!showEndpointInput)}
              variant='outline'
              size='sm'
            >
              Configure Endpoint
            </Button>
            <Button onClick={refreshData} variant='outline' size='sm'>
              <RefreshCw className='mr-2 w-4 h-4' />
              Refresh
            </Button>
          </div>
          {showEndpointInput && (
            <div className='top-24 right-4 z-10 absolute bg-white dark:bg-gray-800 shadow-lg p-4 border border-gray-200 dark:border-gray-700 rounded-lg'>
              <div className='space-y-4'>
                <div>
                  <label className='block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm'>
                    Custom Endpoint URL
                  </label>
                  <input
                    type='text'
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder='https://your-api.com/sensor-data'
                    className='dark:bg-gray-700 shadow-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-white'
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    onClick={() => {
                      setCustomEndpoint('');
                      setShowEndpointInput(false);
                    }}
                    variant='outline'
                    size='sm'
                  >
                    Reset to Default
                  </Button>
                  <Button
                    onClick={() => setShowEndpointInput(false)}
                    variant='outline'
                    size='sm'
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className='bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm mb-6 p-4 border border-white/20 rounded-lg'>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-gray-600 dark:text-gray-300'>
              Last updated: {formatTimeAgo(lastRefresh)}
            </span>
            <div className='flex items-center gap-2'>
              <div className='bg-green-500 rounded-full w-2 h-2 animate-pulse'></div>
              <span className='text-gray-600 dark:text-gray-300'>
                Live monitoring
              </span>
            </div>
          </div>
        </div>

        {/* Sensor Cards Grid */}
        <div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8'>
          {/* Temperature Card */}
          <Card className='bg-gradient-to-br from-orange-400 to-red-500 shadow-xl border-0 text-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex justify-between items-center text-lg'>
                <span>Temperature</span>
                <Thermometer className='w-6 h-6' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='font-bold text-3xl'>
                  {sensorData.temperature.value.toFixed(2)}
                  {sensorData.temperature.unit}
                </div>
                <div className='flex justify-between items-center'>
                  <Badge
                    variant='secondary'
                    className='bg-white/20 border-0 text-white'
                  >
                    Normal
                  </Badge>
                  <span className='opacity-90 text-sm'>
                    {formatTimeAgo(sensorData.temperature.lastUpdated)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Humidity Card */}
          <Card className='bg-gradient-to-br from-blue-400 to-cyan-500 shadow-xl border-0 text-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex justify-between items-center text-lg'>
                <span>Humidity</span>
                <Droplets className='w-6 h-6' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='font-bold text-3xl'>
                  {sensorData.humidity.value.toFixed(1)}
                  {sensorData.humidity.unit}
                </div>
                <div className='flex justify-between items-center'>
                  <Badge
                    variant='secondary'
                    className='bg-white/20 border-0 text-white'
                  >
                    Optimal
                  </Badge>
                  <span className='opacity-90 text-sm'>
                    {formatTimeAgo(sensorData.humidity.lastUpdated)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heat Index Card */}
          <Card className='bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl border-0 text-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex justify-between items-center text-lg'>
                <span>Heat Index</span>
                <Gauge className='w-6 h-6' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='font-bold text-3xl'>
                  {sensorData.heatIndex.value.toFixed(2)}
                  {sensorData.heatIndex.unit}
                </div>
                <div className='flex justify-between items-center'>
                  <Badge
                    variant='secondary'
                    className='bg-white/20 border-0 text-white'
                  >
                    Caution
                  </Badge>
                  <span className='opacity-90 text-sm'>
                    {formatTimeAgo(sensorData.heatIndex.lastUpdated)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Air Quality Card */}
          <Card className='bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl border-0 text-white'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex justify-between items-center text-lg'>
                <span>Air Quality</span>
                <Wind className='w-6 h-6' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='font-bold text-3xl'>
                  {sensorData.airQuality.value} {sensorData.airQuality.unit}
                </div>
                <div className='flex justify-between items-center'>
                  <Badge
                    variant='secondary'
                    className='bg-white/20 border-0 text-white'
                  >
                    {airQualityInfo.category}
                  </Badge>
                  <span className='opacity-90 text-sm'>
                    {formatTimeAgo(sensorData.airQuality.lastUpdated)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Cards */}
        <div className='gap-6 grid grid-cols-1 lg:grid-cols-2'>
          {/* Environmental Summary */}
          <Card className='bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20'>
            <CardHeader>
              <CardTitle className='text-xl'>Environmental Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='gap-4 grid grid-cols-2'>
                <div className='bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 p-4 rounded-lg'>
                  <div className='mb-1 text-gray-600 dark:text-gray-300 text-sm'>
                    Comfort Level
                  </div>
                  <div className='font-semibold text-blue-700 dark:text-blue-300 text-lg'>
                    Comfortable
                  </div>
                </div>
                <div className='bg-gradient-to-r from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 p-4 rounded-lg'>
                  <div className='mb-1 text-gray-600 dark:text-gray-300 text-sm'>
                    Air Quality
                  </div>
                  <div className='font-semibold text-green-700 dark:text-green-300 text-lg'>
                    Good
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-r from-purple-50 dark:from-purple-900/20 to-pink-50 dark:to-pink-900/20 p-4 rounded-lg'>
                <div className='mb-2 text-gray-600 dark:text-gray-300 text-sm'>
                  Recommendations
                </div>
                <ul className='space-y-1 text-gray-700 dark:text-gray-300 text-sm'>
                  <li>• Environment conditions are optimal</li>
                  <li>• Air quality is good for outdoor activities</li>
                  <li>• Monitor heat index during peak hours</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className='bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20'>
            <CardHeader>
              <CardTitle className='text-xl'>System Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg'>
                  <span className='font-medium text-sm'>
                    Temperature Sensor
                  </span>
                  <div className='flex items-center gap-2'>
                    <div className='bg-green-500 rounded-full w-2 h-2'></div>
                    <span className='text-green-700 dark:text-green-300 text-sm'>
                      Online
                    </span>
                  </div>
                </div>
                <div className='flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg'>
                  <span className='font-medium text-sm'>Humidity Sensor</span>
                  <div className='flex items-center gap-2'>
                    <div className='bg-green-500 rounded-full w-2 h-2'></div>
                    <span className='text-green-700 dark:text-green-300 text-sm'>
                      Online
                    </span>
                  </div>
                </div>
                <div className='flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg'>
                  <span className='font-medium text-sm'>
                    Air Quality Sensor
                  </span>
                  <div className='flex items-center gap-2'>
                    <div className='bg-green-500 rounded-full w-2 h-2'></div>
                    <span className='text-green-700 dark:text-green-300 text-sm'>
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className='pt-2 border-gray-200 dark:border-gray-700 border-t'>
                <div className='text-gray-600 dark:text-gray-300 text-sm'>
                  Device ID: IOT-ENV-001
                </div>
                <div className='text-gray-600 dark:text-gray-300 text-sm'>
                  Firmware: v2.1.3
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
