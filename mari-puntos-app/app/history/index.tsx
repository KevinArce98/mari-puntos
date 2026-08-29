import React from 'react';

import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Stack, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { LegendList } from '@legendapp/list/react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HistoryItem } from '@/components';
import { Card, PressableScale, SkeletonList } from '@/components/ui';
import { usePoints, useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { PointsLog } from '@/types';
import logger from '@/utils/logger';

export default function HistoryScreen() {
  const { t } = useTranslation('history');
  const insets = useSafeAreaInsets();
  const colors = useThemedColors();
  const router = useRouter();
  const { pointsHistory, fetchHistory, isLoading, paginationMeta } = usePoints();
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const hasMore = paginationMeta ? paginationMeta.page < paginationMeta.totalPages : true;

  const loadHistory = async (pageNum: number, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      await fetchHistory({ page: pageNum, limit: 20 }, !isRefresh);
    } catch (error) {
      logger.error('Failed to load points history', error as Error, {
        page: pageNum,
        isRefresh,
      });
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    fetchHistory({ page: 1, limit: 20 }, false).catch((error) => {
      logger.error('Failed to load points history', error as Error, {
        page: 1,
        isRefresh: false,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadHistory(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadHistory(nextPage);
    }
  };

  const renderHistoryItem = ({ item }: { item: PointsLog }) => (
    <Card style={styles.historyCard} padding="none">
      <HistoryItem item={item} compact={false} />
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color={colors.text.secondary} />
      <Text style={[styles.emptyText, { color: colors.text.primary }]}>
        {t('empty.title')}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
        {t('empty.subtitle')}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          {t('loadingMore')}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </PressableScale>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <LegendList
        data={pointsHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        estimatedItemSize={72}
      />

      {isLoading && pointsHistory.length === 0 && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
          <SkeletonList count={6} lines={2} style={{ padding: spacing.lg }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
  },
  listContent: {
    padding: spacing.lg,
  },
  historyCard: {
    marginBottom: 0,
  },
  separator: {
    height: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.styles.h3,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.styles.body,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.styles.caption,
  },
});
