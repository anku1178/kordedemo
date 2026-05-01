import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../stores/cartStore';
import { theme, shadows, spacing, borderRadius } from '../theme';

export function CartScreen() {
    const navigation = useNavigation<any>();
    const { items, removeItem, updateQuantity, getSubtotal, getTotal, getItemCount } = useCartStore();

    const renderItem = ({ item, index }: { item: ReturnType<typeof useCartStore.getState>['items'][0]; index: number }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemEmojiCircle}>
                <Text style={styles.itemEmoji}>🛍️</Text>
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.itemUnit}>{item.product.unit}</Text>
                <Text style={styles.itemPrice}>₹{item.product.price} each</Text>
            </View>
            <View style={styles.itemRight}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemTotalRow}>
                    <Text style={styles.itemTotalText}>₹{(item.product.price * item.quantity).toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                        <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyCircle}>
                    <Text style={styles.emptyEmoji}>🛒</Text>
                </View>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>Add some fresh groceries to get started!</Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Home')}
                    buttonColor={theme.colors.primary}
                    style={styles.shopButton}
                    contentStyle={styles.shopButtonContent}
                    labelStyle={styles.shopButtonLabel}
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
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
            />

            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items ({getItemCount()})</Text>
                    <Text style={styles.summaryValue}>₹{getSubtotal().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryDivider} />
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
                    labelStyle={styles.checkoutButtonLabel}
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
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: 180,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.outline,
        marginVertical: 2,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    itemEmojiCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemEmoji: {
        fontSize: 22,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 2,
    },
    itemUnit: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryContainer,
        borderRadius: borderRadius.lg,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    quantityButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        ...shadows.sm,
    },
    quantityButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    quantityText: {
        fontSize: 15,
        fontWeight: '700',
        minWidth: 24,
        textAlign: 'center',
        color: theme.colors.primary,
    },
    itemTotalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemTotalText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.onSurface,
    },
    removeText: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        fontWeight: '600',
        width: 24,
        height: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    summary: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.lg,
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
        fontWeight: '500',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: theme.colors.outline,
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.onSurface,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    checkoutButton: {
        marginTop: spacing.md,
        borderRadius: borderRadius.lg,
    },
    checkoutButtonContent: {
        paddingVertical: 8,
    },
    checkoutButtonLabel: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: theme.colors.background,
    },
    emptyCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyEmoji: {
        fontSize: 52,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.onSurface,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    shopButton: {
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.xl,
    },
    shopButtonContent: {
        paddingVertical: 8,
    },
    shopButtonLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
});
