import React from 'react';

import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Stack } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HistoryItem } from '@/components';
import { Card, SkeletonList } from '@/components/ui';
import { usePoints, useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { PointsLog } from '@/types';
import logger from '@/utils/logger';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemedColors();
  const { pointsHistory, fetchHistory, isLoading, paginationMeta } = usePoints();
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  // Derive hasMore directly from store — no effect lag
  const hasMore = paginationMeta ? paginationMeta.page < paginationMeta.totalPages : true;

  const loadHistory = async (pageNum: number, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      // If refresh, replace data. If loading more, append data
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

  // Load initial data
  React.useEffect(() => {
    if (!initialized) {
      loadHistory(1, true);
      setInitialized(true);
    }
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
        No hay historial
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
        Tus actividades y transacciones aparecerán aquí
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Cargando más...
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Historial',
          headerBackTitle: 'Atrás',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
        }}
      />

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
