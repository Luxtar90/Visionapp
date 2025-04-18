// src/types/custom.d.ts

// Safe Area Context
declare module 'react-native-safe-area-context' {
    // Re-export all the official types
    export * from 'react-native-safe-area-context/lib/typescript';
  }
  
  // React Navigation
  declare module '@react-navigation/native';
  declare module '@react-navigation/native-stack';
  declare module '@react-navigation/bottom-tabs';
  
  // DateTimePicker
  declare module '@react-native-community/datetimepicker' {
    import { ComponentType } from 'react';
    import { ViewProps } from 'react-native';
  
    export interface DateTimePickerProps extends ViewProps {
      value: Date;
      mode?: 'date' | 'time' | 'datetime' | 'countdown';
      display?: 'default' | 'spinner' | 'calendar' | 'clock';
      onChange: (event: any, date?: Date) => void;
      minimumDate?: Date;
      maximumDate?: Date;
      minuteInterval?: number;
      is24Hour?: boolean;
    }
  
    const DateTimePicker: ComponentType<DateTimePickerProps>;
    export default DateTimePicker;
  }
  