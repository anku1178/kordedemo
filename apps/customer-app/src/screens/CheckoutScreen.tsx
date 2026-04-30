import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Switch, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../stores/cartStore';
import { useOrderStore } from '../stores/orderStore';
import { theme } from '../theme';

export function CheckoutScreen() {
    const navigation = useNavigation<any>();
    const { items, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore();
    const { createOrder, loading } = useOrderStore();
    const [customerOutside, setCustomerOutside] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const handlePlaceOrder = async () => {
        setPaymentProcessing(true);

        try {
            // Create order in database
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
                discount: getDiscount(),
                total: getTotal(),
            });

            if (result.error || !result.order) {
                Alert.alert('Order Failed', result.error || 'Something went wrong');
                return;
            }

            // Initiate Razorpay payment
            // Note: In production, you'd use the Razorpay SDK here
            // For now, we'll simulate the payment flow
            const paymentSuccess = await initiateRazorpayPayment(result.order.order_number, getTotal());

            if (paymentSuccess) {
                clearCart();
                navigation.replace('OrderTracking', { orderId: result.order.id });
            } else {
                Alert.alert('Payment Failed', 'Your order was created but payment failed. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setPaymentProcessing(false);
        }
    };

    const initiateRazorpayPayment = async (orderNumber: string, amount: number): Promise<boolean> => {
        // In production, this would use the actual Razorpay SDK:
        //
        // const options = {
        //   description: `Order ${orderNumber}`,
        //   image: '',
        //   currency: 'INR',
        //   key: RAZORPAY_KEY_ID,
        //   amount: amount * 100, // in paise
        //   name: 'Korde Grocery',
        //   order_id: razorpayOrderId, // from server
        //   prefill: { contact: userPhone },
        //   theme: { color: theme.colors.primary },
        // };
        // Razorpay.open(options).then((data) => {
        //   // verify payment with edge function
        // });

        // For now, simulate success
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 1500);
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    {items.map((item) => (
                        <View key={item.product.id} style={styles.orderItem}>
                            <Text style={styles.orderItemName} numberOfLines={1}>
                                {item.product.name}
                            </Text>
                            <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                            <Text style={styles.orderItemPrice}>
                                ₹{(item.product.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                <Divider />

                {/* Pickup Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pickup Details</Text>
                    <View style={styles.pickupInfo}>
                        <Text style={styles.pickupLabel}>📍 Pickup at</Text>
                        <Text style={styles.pickupValue}>Korde Grocery Store</Text>
                    </View>
                    <Text style={styles.pickupNote}>
                        Your order will be ready in approximately 10-15 minutes after confirmation.
                    </Text>
                </View>

                <Divider />

                {/* I'm Outside Toggle */}
                <View style={styles.section}>
                    <View style={styles.outsideRow}>
                        <View style={styles.outsideInfo}>
                            <Text style={styles.outsideTitle}>I'm outside the store</Text>
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

                <Divider />

                {/* Payment Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Subtotal</Text>
                        <Text style={styles.paymentValue}>₹{getSubtotal().toFixed(2)}</Text>
                    </View>
                    {getDiscount() > 0 && (
                        <View style={styles.paymentRow}>
                            <Text style={[styles.paymentLabel, { color: theme.colors.primary }]}>Discount</Text>
                            <Text style={[styles.paymentValue, { color: theme.colors.primary }]}>
                                -₹{getDiscount().toFixed(2)}
                            </Text>
                        </View>
                    )}
                    <Divider style={styles.paymentDivider} />
                    <View style={styles.paymentRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{getTotal().toFixed(2)}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Payment Method</Text>
                        <Text style={styles.paymentValue}>UPI / Card / Wallet</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.bottomBar}>
                <Button
                    mode="contained"
                    onPress={handlePlaceOrder}
                    loading={paymentProcessing || loading}
                    disabled={paymentProcessing || loading || items.length === 0}
                    buttonColor={theme.colors.primary}
                    style={styles.placeOrderButton}
                    contentStyle={styles.placeOrderButtonContent}
                >
                    PAY ₹{getTotal().toFixed(2)} & PLACE ORDER
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
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 12,
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
    pickupInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    pickupLabel: {
        fontSize: 14,
        color: theme.colors.onSurface,
    },
    pickupValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    pickupNote: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        lineHeight: 18,
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
    paymentDivider: {
        marginVertical: 8,
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
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
    },
    placeOrderButton: {
        borderRadius: 12,
    },
    placeOrderButtonContent: {
        paddingVertical: 8,
    },
});
