import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Switch } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useOrderStore } from '../stores/orderStore';
import { theme, shadows, spacing, borderRadius } from '../theme';
import type { Order, OrderStatus } from 'shared-types';

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string; description: string }[] = [
    { key: 'placed', label: 'Order Placed', icon: '📋', description: 'Your order has been received' },
    { key: 'confirmed', label: 'Payment Confirmed', icon: '✅', description: 'Payment verified successfully' },
    { key: 'picking', label: 'Being Picked', icon: '🛒', description: 'Workers are collecting your items' },
    { key: 'ready', label: 'Ready for Pickup', icon: '📦', description: 'Come pick up your order!' },
    { key: 'handed_over', label: 'Handed Over', icon: '🤝', description: 'Order delivered to you' },
];

export function OrderTrackingScreen() {
    const route = useRoute<any>();
    const { orderId } = route.params;
    const { currentOrder, fetchOrderById, setCustomerOutside, subscribeToOrder, cancelOrder } = useOrderStore();
    const [outside, setOutside] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrderById(orderId).then((order) => {
            if (order) useOrderStore.setState({ currentOrder: order });
        });

        const unsubscribe = subscribeToOrder(orderId);
        return () => unsubscribe();
    }, [orderId]);

    const currentStepIndex = currentOrder
        ? STATUS_STEPS.findIndex((s) => s.key === currentOrder.status)
        : -1;

    const isCancelled = currentOrder?.status === 'cancelled';
    const isReady = currentOrder?.status === 'ready';
    const isHandedOver = currentOrder?.status === 'handed_over';

    const handleOutsideToggle = async (value: boolean) => {
        setOutside(value);
        if (currentOrder) {
            await setCustomerOutside(currentOrder.id, value);
        }
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order? This cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        if (!currentOrder) return;
                        setCancelling(true);
                        const { error } = await cancelOrder(currentOrder.id);
                        setCancelling(false);
                        if (error) {
                            Alert.alert('Error', error);
                        }
                    },
                },
            ]
        );
    };

    if (!currentOrder) return null;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Order ID Badge */}
                <View style={styles.orderIdCard}>
                    <Text style={styles.orderIdLabel}>Order ID</Text>
                    <Text style={styles.orderIdValue}>{currentOrder.order_number}</Text>
                    {currentOrder.customer_outside && (
                        <View style={styles.outsideBadge}>
                            <Text style={styles.outsideBadgeText}>📍 You're outside</Text>
                        </View>
                    )}
                </View>

                {/* Status Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Status</Text>
                    {isCancelled ? (
                        <View style={styles.cancelledCard}>
                            <Text style={styles.cancelledEmoji}>❌</Text>
                            <Text style={styles.cancelledText}>Order Cancelled</Text>
                            <Text style={styles.cancelledSubtext}>This order has been cancelled</Text>
                        </View>
                    ) : (
                        <View style={styles.timelineCard}>
                            {STATUS_STEPS.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <View key={step.key} style={styles.timelineStep}>
                                        <View style={styles.timelineLeft}>
                                            <View style={[
                                                styles.timelineDot,
                                                isCompleted && styles.timelineDotCompleted,
                                                isCurrent && styles.timelineDotCurrent,
                                            ]}>
                                                <Text style={[
                                                    styles.timelineIcon,
                                                    isCurrent && styles.timelineIconCurrent,
                                                ]}>{step.icon}</Text>
                                            </View>
                                            {index < STATUS_STEPS.length - 1 && (
                                                <View style={[
                                                    styles.timelineLine,
                                                    index < currentStepIndex && styles.timelineLineCompleted,
                                                ]} />
                                            )}
                                        </View>
                                        <View style={styles.timelineRight}>
                                            <Text style={[
                                                styles.timelineLabel,
                                                isCompleted && styles.timelineLabelCompleted,
                                            ]}>
                                                {step.label}
                                            </Text>
                                            <Text style={styles.timelineDescription}>
                                                {isCurrent ? step.description : ''}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Cancel Order Button */}
                {!isCancelled && !isHandedOver && currentOrder.status === 'placed' && (
                    <View style={styles.cancelSection}>
                        <Button
                            mode="outlined"
                            onPress={handleCancelOrder}
                            textColor={theme.colors.error}
                            buttonColor={theme.colors.errorContainer}
                            loading={cancelling}
                            disabled={cancelling}
                            style={styles.cancelButton}
                            contentStyle={styles.cancelButtonContent}
                        >
                            Cancel Order
                        </Button>
                    </View>
                )}

                {/* I'm Outside Toggle */}
                {!isCancelled && !isHandedOver && (isReady || currentOrder.status === 'confirmed' || currentOrder.status === 'picking') && (
                    <View style={styles.outsideCard}>
                        <View style={styles.outsideRow}>
                            <View style={styles.outsideInfo}>
                                <Text style={styles.outsideTitle}>🚶 I'm outside the store</Text>
                                <Text style={styles.outsideSubtitle}>
                                    Let the staff know you're waiting
                                </Text>
                            </View>
                            <Switch
                                value={outside}
                                onValueChange={handleOutsideToggle}
                                color={theme.colors.primary}
                            />
                        </View>
                    </View>
                )}

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items ({currentOrder.order_items?.length || 0})</Text>
                    <View style={styles.itemsCard}>
                        {currentOrder.order_items?.map((item, index) => (
                            <View key={item.id}>
                                <View style={styles.orderItem}>
                                    <View style={styles.orderItemEmoji}>
                                        <Text style={styles.orderItemEmojiText}>🛍️</Text>
                                    </View>
                                    <Text style={styles.orderItemName} numberOfLines={1}>{item.product_name}</Text>
                                    <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                                    <Text style={styles.orderItemPrice}>₹{item.total_price}</Text>
                                </View>
                                {index < (currentOrder.order_items?.length || 0) - 1 && (
                                    <View style={styles.itemDivider} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Payment Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💳 Payment</Text>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Subtotal</Text>
                            <Text style={styles.paymentValue}>₹{currentOrder.subtotal}</Text>
                        </View>
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.totalLabel}>Total Paid</Text>
                            <Text style={styles.totalValue}>₹{currentOrder.total}</Text>
                        </View>
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Payment Method</Text>
                            <Text style={styles.paymentValue}>
                                {currentOrder.payment_method === 'pay_on_pickup' ? '💵 Pay on Pickup' : (currentOrder.payment_method || 'Online')}
                            </Text>
                        </View>
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Payment Status</Text>
                            <Text style={[
                                styles.paymentValue,
                                currentOrder.payment_status === 'completed' && { color: '#2E7D32' },
                                currentOrder.payment_status === 'pending' && { color: '#F57C00' },
                            ]}>
                                {currentOrder.payment_status === 'completed' ? '✅ Paid' :
                                    currentOrder.payment_status === 'pending' ? '⏳ Pay at Store' :
                                        currentOrder.payment_status === 'failed' ? '❌ Failed' :
                                            currentOrder.payment_status || 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    orderIdCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    orderIdLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    orderIdValue: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    outsideBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        marginTop: spacing.sm,
    },
    outsideBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.onSurface,
        marginBottom: spacing.sm,
    },
    timelineCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    timelineStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minHeight: 64,
    },
    timelineLeft: {
        width: 44,
        alignItems: 'center',
    },
    timelineDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.outline,
    },
    timelineDotCompleted: {
        backgroundColor: theme.colors.primaryContainer,
        borderColor: theme.colors.primary,
    },
    timelineDotCurrent: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        ...shadows.sm,
    },
    timelineIcon: {
        fontSize: 16,
    },
    timelineIconCurrent: {
        fontSize: 18,
    },
    timelineLine: {
        width: 3,
        flex: 1,
        backgroundColor: theme.colors.outline,
        minHeight: 24,
        borderRadius: 2,
    },
    timelineLineCompleted: {
        backgroundColor: theme.colors.primary,
    },
    timelineRight: {
        flex: 1,
        paddingLeft: spacing.md,
        paddingTop: 8,
    },
    timelineLabel: {
        fontSize: 15,
        color: theme.colors.outlineVariant,
        fontWeight: '500',
    },
    timelineLabelCompleted: {
        color: theme.colors.onSurface,
        fontWeight: '700',
    },
    timelineDescription: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 2,
        fontWeight: '500',
    },
    cancelledCard: {
        backgroundColor: theme.colors.errorContainer,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
    },
    cancelledEmoji: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    cancelledText: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.error,
        marginBottom: 4,
    },
    cancelledSubtext: {
        fontSize: 13,
        color: theme.colors.outlineVariant,
    },
    cancelSection: {
        marginBottom: spacing.lg,
    },
    cancelButton: {
        borderColor: theme.colors.error,
        borderWidth: 1,
        borderRadius: borderRadius.lg,
    },
    cancelButtonContent: {
        paddingVertical: 4,
    },
    outsideCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    outsideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    outsideInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    outsideTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 2,
    },
    outsideSubtitle: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
    },
    itemsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    orderItemEmoji: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderItemEmojiText: {
        fontSize: 14,
    },
    orderItemName: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.onSurface,
        fontWeight: '500',
    },
    orderItemQty: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.onSurface,
        minWidth: 60,
        textAlign: 'right',
    },
    itemDivider: {
        height: 1,
        backgroundColor: theme.colors.outline,
    },
    paymentCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    paymentLabel: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    paymentValue: {
        fontSize: 14,
        color: theme.colors.onSurface,
        fontWeight: '500',
    },
    paymentDivider: {
        height: 1,
        backgroundColor: theme.colors.outline,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.onSurface,
    },
    totalValue: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.primary,
    },
});
