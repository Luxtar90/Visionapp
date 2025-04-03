import { StyleProp, ViewStyle } from 'react-native';

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

export interface Service {
  name: string;
  price: number;
  duration: number;
}

export interface AppointmentCardProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  date: string;
  time: string;
  service: Service;
  status: AppointmentStatus;
} 