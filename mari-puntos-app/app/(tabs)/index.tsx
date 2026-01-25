import { ActionCard, Avatar, Card, PointsCard } from '@/components/ui';
import { usePoints, useUser } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, hasPartner } = useUser();
  const { myPoints, myLevel } = usePoints();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data here
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mock recent history data matching design
  const recentHistory = [
    { id: 1, title: 'Washed the dishes', points: 15, type: 'earned', icon: 'water-outline' as const },
    { id: 2, title: 'Game night approved', points: -30, type: 'spent', icon: 'game-controller-outline' as const },
    { id: 3, title: 'Made breakfast', points: 20, type: 'earned', icon: 'restaurant-outline' as const },
  ];

  if (!hasPartner) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Card style={styles.noPartnerCard}>
            <View style={styles.noPartnerIcon}>
              <Ionicons name="people-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.noPartnerTitle}>Link Your Partner!</Text>
            <Text style={styles.noPartnerText}>
              Connect with your partner to start earning and spending MariPuntos together
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/link-partner')}
            >
              <Ionicons name="link" size={20} color={colors.white} />
              <Text style={styles.linkButtonText}>Link Now</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Avatar and Greeting */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              imageUri={user?.avatarUrl}
              name={user?.firstName}
              size="lg"
              showLevel
              level={myLevel}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                Hi, {user?.firstName?.split(' ')[0] || 'there'}! 👋
              </Text>
              <Text style={styles.subtitle}>{"Let's earn some points today"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Points Card */}
        <PointsCard
          points={myPoints}
          label="Current Balance"
          style={styles.pointsCard}
        />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <ActionCard
              title="Solicitar Permiso"
              subtitle="Request permission for an activity"
              icon="hand-right-outline"
              iconBackgroundColor={colors.accent}
              onPress={() => router.push('/permissions/request')}
              style={styles.actionCard}
            />
            <ActionCard
              title="Registrar Acción"
              subtitle="Log an activity to earn points"
              icon="add-circle-outline"
              iconBackgroundColor={colors.primary}
              onPress={() => router.push('/actions')}
              style={styles.actionCard}
            />
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.historyCard} padding="none">
            {recentHistory.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.historyItem,
                  index !== recentHistory.length - 1 && styles.historyItemBorder,
                ]}
              >
                <View style={[
                  styles.historyIconContainer,
                  { backgroundColor: item.type === 'earned' ? `${colors.primary}15` : `${colors.accent}15` }
                ]}>
                  <Ionicons 
                    name={item.icon} 
                    size={20} 
                    color={item.type === 'earned' ? colors.primary : colors.accent} 
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyTime}>2 hours ago</Text>
                </View>
                <Text style={[
                  styles.historyPoints,
                  { color: item.type === 'earned' ? colors.primary : colors.error }
                ]}>
                  {item.type === 'earned' ? '+' : ''}{item.points} pts
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: spacing.md,
  },
  greeting: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsCard: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  historyCard: {
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
  },
  historyTime: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  historyPoints: {
    ...typography.styles.h4,
  },
  // No partner state
  noPartnerCard: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    padding: spacing.xl,
  },
  noPartnerIcon: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  noPartnerTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noPartnerText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  linkButtonText: {
    ...typography.styles.button,
    color: colors.white,
  },
});
