import { ReactNode } from 'react';

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardOffset, useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

import { PressableScale } from './PressableScale';

interface BottomSheetModalProps {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  closeAccessibilityLabel?: string;
  footer?: ReactNode;
  scrollable?: boolean;
  children: ReactNode;
}

export function BottomSheetModal({
  visible,
  onRequestClose,
  title,
  closeAccessibilityLabel,
  footer,
  scrollable = true,
  children,
}: BottomSheetModalProps) {
  const themeColors = useThemedColors();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onRequestClose}
    >
      <View
        style={[styles.overlay, Platform.OS === 'android' && { paddingTop: insets.top }]}
      >
        <KeyboardAvoidingView
          style={[
            styles.keyboardAvoidingView,
            keyboardOffset > 0 && {
              paddingBottom: keyboardOffset + (Platform.OS === 'android' ? 20 : 0),
            },
          ]}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: themeColors.gray[100],
                paddingBottom: spacing.xl + (keyboardOffset > 0 ? 0 : insets.bottom),
              },
            ]}
            accessibilityViewIsModal
          >
            <View style={[styles.header, { borderBottomColor: themeColors.gray[200] }]}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                {title}
              </Text>
              <PressableScale
                onPress={onRequestClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={closeAccessibilityLabel}
              >
                <Ionicons name="close" size={24} color={themeColors.text.primary} />
              </PressableScale>
            </View>

            {scrollable ? (
              <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
            ) : (
              children
            )}

            {footer}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.styles.h3,
  },
  closeButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
