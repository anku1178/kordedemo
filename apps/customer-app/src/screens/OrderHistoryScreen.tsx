import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../stores/orderStore';
import { theme, shadows, spacing, borderRadius } from '../theme';
import type { Order, OrderStatus } from 'shared-types';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; emoji: string }> = {
    placed: { label: 'Placed', color: '#616161', bg: '#F5F5F5', emoji: '📋' },
    confirmed: { label: 'Confirmed', color: '#1565C0', bg: '#E3F2FD', emoji: '✅' },
    picking: { label: 'Picking', color: '#E65100', bg: '#FFF3E0', emoji: '🛒' },
    ready: { label: 'Ready', color: '#2E7D32', bg: '#E8F5E9', emoji: '📦' },
    handed_over: { label: 'Completed', color: '#1B5E20', bg: '#C8E6C9', emoji: '🤝' },
    cancelled: { label: 'Cancelled', color: '#C62828', bg: '#FFEBEE', emoji: '❌' },
};

export function OrderHistoryScreen() {
    const navigation = useNavigation<any>();
    const { orders, fetchOrders, loading } = useOrderStore();

    useEffect(() => {
        fetchOrders();
    }, []);

    const renderOrder = ({ item }: { item: Order }) => {
        const config = statusConfig[item.status] || statusConfig.placed;
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
                activeOpacity={0.7}
            >
                <View style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <View style={styles.orderIdRow}>
                            <View style={styles.orderEmojiCircle}>
                                <Text style={styles.orderEmoji}>{config.emoji}</Text>
                            </View>
                            <View>
                                <Text style={styles.orderNumber}>{item.order_number}</Text>
                                <Text style={styles.orderDate}>
                                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>
                        </View>
                        <Chip
                            style={[styles.statusChip, { backgroundColor: config.bg }]}
                            textStyle={[styles.statusChipText, { color: config.color }]}
                        >
                            {config.label}
                        </Chip>
                    </View>
                    <View style={styles.orderDivider} />
                    <View style={styles.orderFooter}>
                        <Text style={styles.orderItems}>
                            {item.order_items?.length || 0} items
                        </Text>
                        <Text style={styles.orderTotal}>₹{item.total}</Text>
                    </View>
                    {item.customer_outside && item.status === 'ready' && (
                        <View style={styles.outsideIndicator}>
                            <Text style={styles.outsideIndicatorText}>📍 You're outside</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={fetchOrders}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyCircle}>
                            <Text style={styles.emptyEmoji}>📋</Text>
                        </View>
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <Text style={styles.emptySubtext}>Place your first order!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: spacing.md,
    },
    orderCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    orderIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    orderEmojiCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderEmoji: {
        fontSize: 18,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    orderDate: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        marginTop: 1,
    },
    statusChip: {
        height: 28,
    },
    statusChipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    orderDivider: {
        height: 1,
        backgroundColor: theme.colors.outline,
        marginBottom: spacing.sm,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderItems: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.onSurface,
    },
    outsideIndicator: {
        backgroundColor: theme.colors.secondaryContainer,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
        marginTop: spacing.sm,
    },
    outsideIndicatorText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.secondary,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 64,
    },
    emptyCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyEmoji: {
        fontSize: 44,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
});
