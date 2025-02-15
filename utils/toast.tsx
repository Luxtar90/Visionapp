import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  title?: string;
  message: string;
  type?: ToastType;
  position?: 'top' | 'bottom';
  duration?: number;
}

export const showToast = ({
  title,
  message,
  type = 'success',
  position = 'top',
  duration = 3000,
}: ToastProps) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position,
    visibilityTime: duration,
  });
};

export const toastConfig = {
  success: ({ text1, text2, ...rest }: any) => (
    <BaseToast
      {...rest}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1={text1}
      text2={text2}
    />
  ),
  error: ({ text1, text2, ...rest }: any) => (
    <ErrorToast
      {...rest}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1={text1}
      text2={text2}
    />
  ),
  info: ({ text1, text2, ...rest }: any) => (
    <BaseToast
      {...rest}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1={text1}
      text2={text2}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#10B981',
    backgroundColor: '#ECFDF5',
    height: 'auto',
    minHeight: 60,
    paddingVertical: 8,
  },
  errorToast: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    height: 'auto',
    minHeight: 60,
    paddingVertical: 8,
  },
  infoToast: {
    borderLeftColor: '#6B46C1',
    backgroundColor: '#FAF5FF',
    height: 'auto',
    minHeight: 60,
    paddingVertical: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  text2: {
    fontSize: 14,
    color: '#4B5563',
  },
});
