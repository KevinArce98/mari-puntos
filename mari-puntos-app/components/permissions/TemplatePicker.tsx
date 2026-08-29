import { useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Card, PressableScale } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import i18n from '@/i18n';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { PermissionTemplate } from '@/types';

interface TemplatePickerProps {
  templates: PermissionTemplate[];
  selectedTemplate: PermissionTemplate | null;
  onSelect: (template: PermissionTemplate) => void;
}

export function TemplatePicker({
  templates,
  selectedTemplate,
  onSelect,
}: TemplatePickerProps) {
  const { t } = useTranslation('permissions');
  const themeColors = useThemedColors();
  const [showPicker, setShowPicker] = useState(false);

  const sortedTemplates = [...templates].sort((a, b) =>
    a.title.localeCompare(b.title, i18n.language)
  );

  const handleSelect = (template: PermissionTemplate) => {
    onSelect(template);
    setShowPicker(false);
  };

  return (
    <View style={styles.allTemplatesSection}>
      {showPicker && (
        <Pressable style={styles.dropdownBackdrop} onPress={() => setShowPicker(false)} />
      )}
      <PressableScale
        style={[styles.dropdown, { backgroundColor: themeColors.gray[100] }]}
        onPress={() => setShowPicker(!showPicker)}
      >
        {selectedTemplate?.metadata?.icon && (
          <View
            style={[styles.dropdownIcon, { backgroundColor: `${themeColors.primary}15` }]}
          >
            <Ionicons
              name={selectedTemplate.metadata.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={themeColors.primary}
            />
          </View>
        )}
        <Text
          style={[
            styles.dropdownText,
            { color: themeColors.text.primary },
            !selectedTemplate && { color: themeColors.gray[400] },
          ]}
        >
          {selectedTemplate ? selectedTemplate.title : t('request.selectActivity')}
        </Text>
        <Ionicons
          name={showPicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColors.gray[400]}
        />
      </PressableScale>

      {showPicker && (
        <Card style={styles.dropdownMenu} padding="none">
          {sortedTemplates.length === 0 ? (
            <View style={styles.emptyTemplates}>
              <Ionicons
                name="information-circle-outline"
                size={48}
                color={themeColors.gray[400]}
              />
              <Text
                style={[styles.emptyTemplatesText, { color: themeColors.text.primary }]}
              >
                {t('request.noTemplatesAvailable')}
              </Text>
            </View>
          ) : (
            sortedTemplates.map((template) => (
              <PressableScale
                key={template.id}
                style={[
                  styles.dropdownItem,
                  { borderBottomColor: themeColors.gray[100] },
                  selectedTemplate?.id === template.id && {
                    backgroundColor: `${themeColors.primary}10`,
                  },
                ]}
                onPress={() => handleSelect(template)}
              >
                {template.metadata?.icon && (
                  <View
                    style={[
                      styles.dropdownItemIcon,
                      { backgroundColor: `${themeColors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name={template.metadata.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={themeColors.primary}
                    />
                  </View>
                )}
                <View style={styles.dropdownItemContent}>
                  <View style={styles.dropdownItemTitleRow}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: themeColors.text.primary },
                      ]}
                    >
                      {template.title}
                    </Text>
                    {!template.isSystemTemplate && (
                      <Ionicons
                        name="star"
                        size={16}
                        color={themeColors.accent}
                        style={styles.customBadge}
                      />
                    )}
                  </View>
                  {template.description && (
                    <Text
                      style={[
                        styles.dropdownItemDescription,
                        { color: themeColors.text.secondary },
                      ]}
                    >
                      {template.description}
                    </Text>
                  )}
                </View>
                {template.suggestedPointsCost && (
                  <Text style={[styles.dropdownItemCost, { color: themeColors.primary }]}>
                    {template.suggestedPointsCost} pts
                    {template.suggestedDurationHours &&
                      `/${template.suggestedDurationHours}h`}
                  </Text>
                )}
              </PressableScale>
            ))
          )}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  allTemplatesSection: { zIndex: 10 },
  dropdownBackdrop: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    right: -9999,
    bottom: -9999,
    zIndex: 9,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    zIndex: 10,
    ...shadows.sm,
  },
  dropdownIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  dropdownText: { ...typography.styles.body, flex: 1 },
  dropdownMenu: { marginTop: spacing.sm, overflow: 'hidden', zIndex: 10 },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  dropdownItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  dropdownItemContent: { flex: 1, marginRight: spacing.sm },
  dropdownItemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dropdownItemText: { ...typography.styles.body },
  dropdownItemDescription: { ...typography.styles.caption, marginTop: spacing.xs },
  dropdownItemCost: { ...typography.styles.caption },
  customBadge: { marginLeft: spacing.xs / 2 },
  emptyTemplates: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTemplatesText: { ...typography.styles.bodyMedium, textAlign: 'center' },
});
