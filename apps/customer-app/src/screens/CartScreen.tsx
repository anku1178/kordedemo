import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../stores/cartStore';
import { theme } from '../theme';

export function CartScreen() {
    const navigation = useNavigation<any>();
    const { items, removeItem, updateQuantity, getSubtotal, getDiscount, getTotal, getItemCount } = useCartStore();

    const renderItem = ({ item }: { item: ReturnType<typeof useCartStore.getState>['items'][0] }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.itemUnit}>{item.product.unit}</Text>
                <View style={styles.itemPriceRow}>
                    <Text style={styles.itemPrice}>₹{item.product.price}</Text>
                    {item.product.mrp > item.product.price && (
                        <Text style={styles.itemMrp}>₹{item.product.mrp}</Text>
                    )}
                </View>
            </View>
            <View style={styles.quantityContainer}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                    <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                    <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.itemTotal}>
                <Text style={styles.itemTotalText}>₹{(item.product.price * item.quantity).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>Add some groceries to get started!</Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Home')}
                    buttonColor={theme.colors.primary}
                    style={styles.shopButton}
                >
                    Browse Products
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.product.id}
                ItemSeparatorComponent={() => <Divider />}
                contentContainerStyle={styles.listContent}
            />

            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items ({getItemCount()})</Text>
                    <Text style={styles.summaryValue}>₹{getSubtotal().toFixed(2)}</Text>
                </View>
                {getDiscount() > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.colors.primary }]}>Discount</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>-₹{getDiscount().toFixed(2)}</Text>
                    </View>
                )}
                <Divider style={styles.divider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{getTotal().toFixed(2)}</Text>
                </View>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Checkout')}
                    buttonColor={theme.colors.primary}
                    style={styles.checkoutButton}
                    contentStyle={styles.checkoutButtonContent}
                >
                    PROCEED TO CHECKOUT • ₹{getTotal().toFixed(2)}
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
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.onSurface,
        marginBottom: 2,
    },
    itemUnit: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        marginBottom: 4,
    },
    itemPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    itemMrp: {
        fontSize: 11,
        color: theme.colors.outlineVariant,
        textDecorationLine: 'line-through',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    quantityButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        minWidth: 20,
        textAlign: 'center',
    },
    itemTotal: {
        alignItems: 'flex-end',
        minWidth: 70,
    },
    itemTotalText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    removeText: {
        fontSize: 12,
        color: theme.colors.error,
    },
    summary: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    summaryValue: {
        fontSize: 14,
        color: theme.colors.onSurface,
    },
    divider: {
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
    checkoutButton: {
        marginTop: 12,
        borderRadius: 12,
    },
    checkoutButtonContent: {
        paddingVertical: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        marginBottom: 24,
    },
    shopButton: {
        borderRadius: 12,
        paddingHorizontal: 24,
    },
});
