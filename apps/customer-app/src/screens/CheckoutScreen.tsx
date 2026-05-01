import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Switch, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../stores/cartStore';
import { useOrderStore } from '../stores/orderStore';
import { theme, shadows, spacing, borderRadius } from '../theme';

export function CheckoutScreen() {
    const navigation = useNavigation<any>();
    const { items, getSubtotal, getTotal, clearCart } = useCartStore();
    const { createOrder, loading } = useOrderStore();
    const [customerOutside, setCustomerOutside] = useState(false);

    const handlePlaceOrder = async () => {
        try {
            const orderItems = items.map((item) => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.price,
                totalPrice: item.product.price * item.quantity,
            }));

            const result = await createOrder({
                customerOutside,
                items: orderItems,
                subtotal: getSubtotal(),
                discount: 0,
                total: getTotal(),
            });

            if (result.error || !result.order) {
                Alert.alert('Order Failed', result.error || 'Something went wrong');
                return;
            }

            clearCart();
            navigation.replace('OrderTracking', { orderId: result.order.id });
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🛍️ Order Summary</Text>
                    <View style={styles.itemsCard}>
                        {items.map((item, index) => (
                            <View key={item.product.id}>
                                <View style={styles.orderItem}>
                                    <View style={styles.orderItemLeft}>
                                        <Text style={styles.orderItemName} numberOfLines={1}>
                                            {item.product.name}
                                        </Text>
                                        <Text style={styles.orderItemUnit}>{item.product.unit}</Text>
                                    </View>
                                    <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                                    <Text style={styles.orderItemPrice}>
                                        ₹{(item.product.price * item.quantity).toFixed(2)}
                                    </Text>
                                </View>
                                {index < items.length - 1 && <View style={styles.itemDivider} />}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pickup Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Pickup Details</Text>
                    <View style={styles.pickupCard}>
                        <View style={styles.pickupRow}>
                            <View style={styles.pickupIconCircle}>
                                <Text style={styles.pickupIcon}>🏪</Text>
                            </View>
                            <View style={styles.pickupInfo}>
                                <Text style={styles.pickupLabel}>Pickup at</Text>
                                <Text style={styles.pickupValue}>Korde Grocery Store</Text>
                            </View>
                        </View>
                        <View style={styles.pickupNoteBox}>
                            <Text style={styles.pickupNote}>
                                ⏱️ Your order will be ready in approximately 10-15 minutes after confirmation.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* I'm Outside Toggle */}
                <View style={styles.section}>
                    <View style={styles.outsideCard}>
                        <View style={styles.outsideRow}>
                            <View style={styles.outsideInfo}>
                                <Text style={styles.outsideTitle}>🚶 I'm outside the store</Text>
                                <Text style={styles.outsideSubtitle}>
                                    Let the staff know you're waiting outside
                                </Text>
                            </View>
                            <Switch
                                value={customerOutside}
                                onValueChange={setCustomerOutside}
                                color={theme.colors.primary}
                            />
                        </View>
                    </View>
                </View>

                {/* Payment Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💳 Payment Summary</Text>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Subtotal</Text>
                            <Text style={styles.paymentValue}>₹{getSubtotal().toFixed(2)}</Text>
                        </View>
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{getTotal().toFixed(2)}</Text>
                        </View>
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Payment Method</Text>
                            <Text style={styles.paymentValue}>💵 Pay on Pickup</Text>
                        </View>
                    </View>
                    <View style={styles.payOnPickupNote}>
                        <Text style={styles.payOnPickupText}>
                            💡 Pay at the store counter when you pick up your order
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.bottomBar}>
                <Button
                    mode="contained"
                    onPress={handlePlaceOrder}
                    loading={loading}
                    disabled={loading || items.length === 0}
                    buttonColor={theme.colors.primary}
                    style={styles.placeOrderButton}
                    contentStyle={styles.placeOrderButtonContent}
                    labelStyle={styles.placeOrderButtonLabel}
                >
                    PLACE ORDER • ₹{getTotal().toFixed(2)}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.onSurface,
        marginBottom: spacing.sm,
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
    orderItemLeft: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurface,
    },
    orderItemUnit: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
    },
    orderItemQty: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        fontWeight: '500',
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
    pickupCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    pickupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    pickupIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupIcon: {
        fontSize: 20,
    },
    pickupInfo: {
        flex: 1,
    },
    pickupLabel: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
    },
    pickupValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    pickupNoteBox: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: borderRadius.md,
        padding: spacing.sm + 2,
    },
    pickupNote: {
        fontSize: 13,
        color: theme.colors.onSurfaceVariant,
        lineHeight: 19,
    },
    outsideCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
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
    payOnPickupNote: {
        backgroundColor: theme.colors.primaryContainer,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.sm,
    },
    payOnPickupText: {
        fontSize: 13,
        color: theme.colors.primary,
        textAlign: 'center',
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        ...shadows.lg,
    },
    placeOrderButton: {
        borderRadius: borderRadius.lg,
    },
    placeOrderButtonContent: {
        paddingVertical: 8,
    },
    placeOrderButtonLabel: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
