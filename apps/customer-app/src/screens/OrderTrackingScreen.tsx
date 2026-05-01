import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Switch } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useOrderStore } from '../stores/orderStore';
import { theme } from '../theme';
import type { Order, OrderStatus } from 'shared-types';

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
    { key: 'placed', label: 'Order Placed', icon: '📋' },
    { key: 'confirmed', label: 'Payment Confirmed', icon: '✅' },
    { key: 'picking', label: 'Being Picked', icon: '🛒' },
    { key: 'ready', label: 'Ready for Pickup', icon: '📦' },
    { key: 'handed_over', label: 'Handed Over', icon: '🤝' },
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Order ID Badge */}
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Order ID</Text>
                    <Text style={styles.orderIdValue}>{currentOrder.order_number}</Text>
                    {currentOrder.customer_outside && (
                        <View style={styles.outsideBadge}>
                            <Text style={styles.outsideBadgeText}>📍 You're outside</Text>
                        </View>
                    )}
                </View>

                {/* Status Timeline */}
                <View style={styles.timelineContainer}>
                    <Text style={styles.sectionTitle}>Order Status</Text>
                    {isCancelled ? (
                        <View style={styles.cancelledContainer}>
                            <Text style={styles.cancelledEmoji}>❌</Text>
                            <Text style={styles.cancelledText}>Order Cancelled</Text>
                        </View>
                    ) : (
                        STATUS_STEPS.map((step, index) => {
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
                                            <Text style={styles.timelineIcon}>{step.icon}</Text>
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
                                        {isCurrent && step.key === 'picking' && (
                                            <Text style={styles.timelineSubtext}>
                                                Workers are collecting your items...
                                            </Text>
                                        )}
                                        {isCurrent && step.key === 'ready' && (
                                            <Text style={styles.timelineSubtext}>
                                                Your order is ready! Come pick it up 🎉
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })
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
                        >
                            Cancel Order
                        </Button>
                    </View>
                )}

                {/* I'm Outside Toggle */}
                {!isCancelled && !isHandedOver && (isReady || currentOrder.status === 'confirmed' || currentOrder.status === 'picking') && (
                    <View style={styles.outsideSection}>
                        <View style={styles.outsideRow}>
                            <View style={styles.outsideInfo}>
                                <Text style={styles.outsideTitle}>I'm outside the store</Text>
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
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionTitle}>Items ({currentOrder.order_items?.length || 0})</Text>
                    {currentOrder.order_items?.map((item) => (
                        <View key={item.id} style={styles.orderItem}>
                            <Text style={styles.orderItemName} numberOfLines={1}>{item.product_name}</Text>
                            <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                            <Text style={styles.orderItemPrice}>₹{item.total_price}</Text>
                        </View>
                    ))}
                </View>

                {/* Payment Summary */}
                <View style={styles.paymentSection}>
                    <Text style={styles.sectionTitle}>Payment</Text>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Subtotal</Text>
                        <Text style={styles.paymentValue}>₹{currentOrder.subtotal}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>₹{currentOrder.total}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Payment Method</Text>
                        <Text style={styles.paymentValue}>
                            {currentOrder.payment_method === 'pay_on_pickup' ? '💵 Pay on Pickup' : (currentOrder.payment_method || 'Online')}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Payment Status</Text>
                        <Text style={[
                            styles.paymentValue,
                            currentOrder.payment_status === 'completed' && { color: '#4CAF50' },
                            currentOrder.payment_status === 'pending' && { color: '#FF9800' },
                        ]}>
                            {currentOrder.payment_status === 'completed' ? '✅ Paid' :
                                currentOrder.payment_status === 'pending' ? '⏳ Pay at Store' :
                                    currentOrder.payment_status === 'failed' ? '❌ Failed' :
                                        currentOrder.payment_status || 'Pending'}
                        </Text>
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
        padding: 16,
        paddingBottom: 32,
    },
    orderIdContainer: {
        backgroundColor: theme.colors.primaryContainer,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    orderIdLabel: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        marginBottom: 4,
    },
    orderIdValue: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.primary,
        letterSpacing: 2,
    },
    outsideBadge: {
        backgroundColor: theme.colors.secondaryContainer,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
    },
    outsideBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 16,
    },
    timelineContainer: {
        marginBottom: 24,
    },
    timelineStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minHeight: 60,
    },
    timelineLeft: {
        width: 40,
        alignItems: 'center',
    },
    timelineDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
    },
    timelineIcon: {
        fontSize: 16,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: theme.colors.outline,
        minHeight: 24,
    },
    timelineLineCompleted: {
        backgroundColor: theme.colors.primary,
    },
    timelineRight: {
        flex: 1,
        paddingLeft: 12,
        paddingTop: 6,
    },
    timelineLabel: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        fontWeight: '500',
    },
    timelineLabelCompleted: {
        color: theme.colors.onSurface,
        fontWeight: '600',
    },
    timelineSubtext: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 2,
    },
    cancelledContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    cancelledEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    cancelledText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.error,
    },
    cancelSection: {
        marginBottom: 24,
    },
    cancelButton: {
        borderColor: theme.colors.error,
        borderWidth: 1,
    },
    outsideSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.outline,
    },
    outsideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    outsideInfo: {
        flex: 1,
        marginRight: 12,
    },
    outsideTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 2,
    },
    outsideSubtitle: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
    },
    itemsSection: {
        marginBottom: 24,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    orderItemName: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.onSurface,
    },
    orderItemQty: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurface,
        minWidth: 60,
        textAlign: 'right',
    },
    paymentSection: {
        marginBottom: 24,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    paymentValue: {
        fontSize: 14,
        color: theme.colors.onSurface,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.onSurface,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
});
