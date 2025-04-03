import { Alert } from 'react-native';

interface AlertOptions {
  title?: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export const useAlert = () => {
  const showAlert = (options: AlertOptions) => {
    Alert.alert(
      options.title || 'Atención',
      options.message,
      options.buttons || [{ text: 'OK' }]
    );
  };

  const showSuccess = (message: string) => {
    showAlert({
      title: '¡Éxito!',
      message,
      buttons: [{ text: 'OK' }]
    });
  };

  const showError = (message: string) => {
    showAlert({
      title: 'Error',
      message,
      buttons: [{ text: 'OK' }]
    });
  };

  const showConfirm = (options: AlertOptions & { onConfirm: () => void; onCancel?: () => void }) => {
    showAlert({
      title: options.title || '¿Estás seguro?',
      message: options.message,
      buttons: [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: options.onCancel
        },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: options.onConfirm
        }
      ]
    });
  };

  return {
    showAlert,
    showSuccess,
    showError,
    showConfirm
  };
};

export default useAlert;
