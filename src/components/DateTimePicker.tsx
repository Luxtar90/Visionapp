import React, { useState } from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';

interface Props {
  mode: 'date' | 'time';
  date: Date;
  onChange: (date: Date) => void;
}

const DateTimeInput: React.FC<Props> = ({ mode, date, onChange }) => {
  const [show, setShow] = useState(false);

  const showPicker = () => setShow(true);
  const onChangeInternal = (_event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatted =
    mode === 'date'
      ? date.toLocaleDateString()
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View>
      <TouchableOpacity onPress={showPicker} style={styles.button}>
        <Text style={styles.text}>{formatted}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date}
          mode={mode}
          display="default"
          onChange={onChangeInternal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
});

export default DateTimeInput;
