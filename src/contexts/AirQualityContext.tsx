import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getAQI, getAQIHistory } from '../services/aqiService';
import { AQIData } from '../types';

// Define types for our context
interface AirQualityReading {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  timestamp: number;
  pollutants: {
    aqi: number;
    no2: number;
    so2: number;
    o3: number;
    pm25: number;
    pm10: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
  };
}

interface AirQualityContextType {
  currentReading: AirQualityReading | null;
  historicalData: AirQualityReading[];
  isLoading: boolean;
  error: string | null;
  fetchAirQualityData: () => Promise<void>;
}

// Create context
const AirQualityContext = createContext<AirQualityContextType | undefined>(undefined);

// Create provider component
export const AirQualityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentReading, setCurrentReading] = useState<AirQualityReading | null>(null);
  const [historicalData, setHistoricalData] = useState<AirQualityReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm chuyển đổi dữ liệu từ API sang định dạng AirQualityReading
  const transformAQIData = (apiData: AQIData): AirQualityReading => {
    // Lấy lat, lon từ dữ liệu thành phố
    const geo = apiData.city?.geo || [0, 0];
    
    return {
      location: {
        name: apiData.city?.name || 'Unknown Location',
        lat: geo[0] || 0,
        lon: geo[1] || 0,
      },
      timestamp: apiData.time?.v ? apiData.time.v * 1000 : Date.now(), // Chuyển đổi timestamp Unix sang JavaScript
      pollutants: {
        aqi: apiData.aqi || 0,
        no2: apiData.iaqi?.no2?.v || 0,
        so2: apiData.iaqi?.so2?.v || 0,
        o3: apiData.iaqi?.o3?.v || 0,
        pm25: apiData.iaqi?.pm25?.v || 0,
        pm10: apiData.iaqi?.pm10?.v || 0,
      },
      weather: {
        temperature: apiData.iaqi?.t?.v || 0, 
        humidity: apiData.iaqi?.h?.v || 0,
        pressure: apiData.iaqi?.p?.v || 0,
        windSpeed: apiData.iaqi?.w?.v || 0,
      },
    };
  };

  // Tạo dữ liệu lịch sử từ dự báo (nếu có) hoặc từ giá trị hiện tại
  const generateHistoricalData = (apiData: AQIData): AirQualityReading[] => {
    const historical: AirQualityReading[] = [];
    const currentReading = transformAQIData(apiData);
    const now = Date.now();
    
    // Sử dụng dữ liệu dự báo nếu có
    if (apiData.forecast?.daily?.pm25) {
      // Biến đổi dữ liệu dự báo thành định dạng lịch sử
      apiData.forecast.daily.pm25.forEach((item, index) => {
        const timestamp = new Date(item.day).getTime() + index * 3600 * 1000; // Thêm giờ để xé nhỏ dự báo ngày
        
        historical.push({
          location: currentReading.location,
          timestamp,
          pollutants: {
            aqi: item.avg || 0, // Sử dụng giá trị trung bình làm AQI
            no2: currentReading.pollutants.no2,
            so2: currentReading.pollutants.so2,
            o3: currentReading.pollutants.o3,
            pm25: item.avg || 0,
            pm10: apiData.forecast?.daily?.pm10?.[index]?.avg || 0,
          },
          weather: { ...currentReading.weather }
        });
      });
    } else {
      // Nếu không có dữ liệu dự báo, tạo dữ liệu lịch sử dựa trên giá trị hiện tại với biến thiên nhỏ
      for (let i = 23; i >= 0; i--) {
        const timestamp = now - i * 60 * 60 * 1000; // Lùi lại i giờ
        const variationFactor = 0.1; // Hệ số biến thiên 10%
        
        historical.push({
          location: currentReading.location,
          timestamp,
          pollutants: {
            aqi: Math.max(1, currentReading.pollutants.aqi * (1 + (Math.random() * 2 - 1) * variationFactor)),
            no2: Math.max(0, currentReading.pollutants.no2 * (1 + (Math.random() * 2 - 1) * variationFactor)),
            so2: Math.max(0, currentReading.pollutants.so2 * (1 + (Math.random() * 2 - 1) * variationFactor)),
            o3: Math.max(0, currentReading.pollutants.o3 * (1 + (Math.random() * 2 - 1) * variationFactor)),
            pm25: Math.max(0, currentReading.pollutants.pm25 * (1 + (Math.random() * 2 - 1) * variationFactor)),
            pm10: Math.max(0, currentReading.pollutants.pm10 * (1 + (Math.random() * 2 - 1) * variationFactor)),
          },
          weather: {
            temperature: Math.max(0, currentReading.weather.temperature * (1 + (Math.random() * 2 - 1) * variationFactor/2)),
            humidity: Math.min(100, Math.max(0, currentReading.weather.humidity * (1 + (Math.random() * 2 - 1) * variationFactor/2))),
            pressure: currentReading.weather.pressure * (1 + (Math.random() * 2 - 1) * variationFactor/5),
            windSpeed: Math.max(0, currentReading.weather.windSpeed * (1 + (Math.random() * 2 - 1) * variationFactor)),
          }
        });
      }
    }
    
    return historical;
  };

  // Function to fetch air quality data
  const fetchAirQualityData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Gọi API lấy dữ liệu thực
      const apiData = await getAQI();
      console.log('API data received:', apiData);
      
      // Chuyển đổi dữ liệu API sang định dạng context
      const transformedData = transformAQIData(apiData);
      setCurrentReading(transformedData);
      
      // Lấy hoặc tạo dữ liệu lịch sử
      const historyData = generateHistoricalData(apiData);
      setHistoricalData(historyData);
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('Failed to fetch air quality data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchAirQualityData();
  }, []);

  return (
    <AirQualityContext.Provider
      value={{
        currentReading,
        historicalData,
        isLoading,
        error,
        fetchAirQualityData,
      }}
    >
      {children}
    </AirQualityContext.Provider>
  );
};

// Custom hook for using the AirQuality context
export const useAirQuality = () => {
  const context = useContext(AirQualityContext);
  if (context === undefined) {
    throw new Error('useAirQuality must be used within an AirQualityProvider');
  }
  return context;
};

export default AirQualityContext; 