import { Alert } from 'react-native';

import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';

interface DiscardConfirmOptions {
  enabled: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

export const useDiscardConfirm = ({
  enabled,
  title,
  message,
  confirmLabel,
  cancelLabel,
}: DiscardConfirmOptions) => {
  const navigation = useNavigation();

  usePreventRemove(enabled, ({ data }) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel' },
      {
        text: confirmLabel,
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });
};
