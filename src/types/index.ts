import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
  Notifications: undefined;
  Profile: undefined;
  Export: undefined;
  Login: undefined;
  Register: undefined;
  [key: string]: undefined | object;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export interface AQIData {
  aqi: number;
  city: {
    name: string;
    geo?: [number, number];
    url?: string;
    location?: string;
  };
  dominentpol: string;
  iaqi: {
    [key: string]: {
      v: number;
    };
  };
  time: {
    s: string;
    tz: string;
    v: number;
    iso?: string;
  };
  forecast?: {
    daily?: {
      o3?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
      pm10?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
      pm25?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
      uvi?: Array<{
        avg: number;
        day: string;
        max: number;
        min: number;
      }>;
    };
  };
  attributions?: Array<{
    url: string;
    name: string;
    logo?: string;
  }>;
  debug?: {
    sync: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: Date;
  data: any;
}

export interface AQILevel {
  level: string;
  emoji: string;
  message: string;
  color: string;
}

export interface DataPoint {
  time: string;
  aqi: number;
} 