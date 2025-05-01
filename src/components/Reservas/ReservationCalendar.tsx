import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { colors } from '../../theme/colors';
import CalendarLegend from './CalendarLegend';

interface MarkedDates {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    disabled?: boolean;
    selectedColor?: string;
    dots?: Array<{key: string, color: string, selectedDotColor?: string}>;
  };
}

interface ReservationCalendarProps {
  selectedDate: Date;
  markedDates: MarkedDates;
  onDateSelect: (date: DateData) => void;
  onMonthChange?: (monthData: any) => void;
  loading?: boolean;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  selectedDate,
  markedDates,
  onDateSelect,
  onMonthChange,
  loading
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.dateLabel}>Selecciona una fecha:</Text>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate.toISOString().split('T')[0]}
          minDate={new Date().toISOString().split('T')[0]}
          onDayPress={onDateSelect}
          markedDates={markedDates}
          theme={{
            todayTextColor: colors.primary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            dotColor: colors.primary,
            selectedDotColor: '#ffffff',
            arrowColor: colors.primary,
            monthTextColor: colors.primary,
            indicatorColor: colors.primary,
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
            textSectionTitleColor: '#000000',
            textDayFontColor: '#000000',
            textDayHeaderFontColor: '#000000',
          }}
          markingType="dot"
          onMonthChange={onMonthChange}
        />
      </View>
      <CalendarLegend />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  calendarContainer: {
    marginBottom: 5,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    elevation: 2,
  },
});

export default ReservationCalendar;
