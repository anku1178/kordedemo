import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../stores/orderStore';
import { theme } from '../theme';
import type { Order, OrderStatus } from 'shared-types';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    placed: { label: 'Placed', color: '#9E9E9E', bg: '#F5F5F5' },
    confirmed: { label: 'Confirmed', color: '#2196F3', bg: '#E3F2FD' },
    picking: { label: 'Picking', color: '#FF9800', bg: '#FFF3E0' },
    ready: { label: 'Ready', color: '#4CAF50', bg: '#E8F5E9' },
    handed_over: { label: 'Completed', color: '#4CAF50', bg: '#C8E6C9' },
    cancelled: { label: 'Cancelled', color: '#F44336', bg: '#FFEBEE' },
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
            <TouchableOpacity onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}>
                <Card style={styles.orderCard}>
                    <Card.Content>
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderNumber}>{item.order_number}</Text>
                            <Chip
                                style={[styles.statusChip, { backgroundColor: config.bg }]}
                                textStyle={[styles.statusChipText, { color: config.color }]}
                            >
                                {config.label}
                            </Chip>
                        </View>
                        <View style={styles.orderDetails}>
                            <Text style={styles.orderItems}>
                                {item.order_items?.length || 0} items
                            </Text>
                            <Text style={styles.orderTotal}>₹{item.total}</Text>
                        </View>
                        <Text style={styles.orderDate}>
                            {new Date(item.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                        {item.customer_outside && item.status === 'ready' && (
                            <View style={styles.outsideIndicator}>
                                <Text style={styles.outsideIndicatorText}>📍 You're outside</Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>
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
                        <Text style={styles.emptyEmoji}>📋</Text>
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
        padding: 16,
    },
    orderCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    statusChip: {
        height: 28,
    },
    statusChipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    orderItems: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    orderTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurface,
    },
    orderDate: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
    },
    outsideIndicator: {
        backgroundColor: theme.colors.secondaryContainer,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    outsideIndicatorText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 48,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
});
