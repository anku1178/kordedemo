import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useCartStore } from '../stores/cartStore';
import { theme, shadows, spacing, borderRadius } from '../theme';
import type { Product } from 'shared-types';

export function ProductScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { productId } = route.params;
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        const { data } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('id', productId)
            .single();

        if (data) setProduct(data as Product);
    };

    if (!product) return null;

    const handleAddToCart = () => {
        addItem(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const inStock = product.is_available && product.stock_quantity > 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Product Image Area */}
                <View style={styles.imageContainer}>
                    {product.image_url ? (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>🥬</Text>
                        </View>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>
                                {getProductEmoji(product.category?.slug || '')}
                            </Text>
                        </View>
                    )}
                    {product.category && (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{product.category.name}</Text>
                        </View>
                    )}
                </View>

                {/* Product Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.nameRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <View style={[styles.stockBadge, inStock ? styles.stockBadgeIn : styles.stockBadgeOut]}>
                            <Text style={[styles.stockBadgeText, inStock ? styles.stockBadgeTextIn : styles.stockBadgeTextOut]}>
                                {inStock ? '✓ In Stock' : '✕ Out'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.unitText}>{product.unit}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.price}</Text>
                        <Text style={styles.perUnit}>per {product.unit}</Text>
                    </View>

                    {product.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionLabel}>About this product</Text>
                            <Text style={styles.description}>{product.description}</Text>
                        </View>
                    )}
                </View>

                {/* Quick Info Cards */}
                <View style={styles.quickInfoRow}>
                    <View style={styles.quickInfoCard}>
                        <Text style={styles.quickInfoEmoji}>🏪</Text>
                        <Text style={styles.quickInfoLabel}>Pickup</Text>
                        <Text style={styles.quickInfoValue}>In Store</Text>
                    </View>
                    <View style={styles.quickInfoCard}>
                        <Text style={styles.quickInfoEmoji}>💵</Text>
                        <Text style={styles.quickInfoLabel}>Payment</Text>
                        <Text style={styles.quickInfoValue}>At Counter</Text>
                    </View>
                    <View style={styles.quickInfoCard}>
                        <Text style={styles.quickInfoEmoji}>📦</Text>
                        <Text style={styles.quickInfoLabel}>Stock</Text>
                        <Text style={styles.quickInfoValue}>{product.stock_quantity} left</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(quantity + 1)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <Button
                    mode="contained"
                    onPress={handleAddToCart}
                    style={styles.addToCartButton}
                    buttonColor={added ? '#4CAF50' : theme.colors.primary}
                    disabled={!product.is_available}
                    contentStyle={styles.addToCartContent}
                    labelStyle={styles.addToCartLabel}
                >
                    {added ? '✓ ADDED' : `ADD • ₹${(product.price * quantity).toFixed(2)}`}
                </Button>
            </View>
        </View>
    );
}

function getProductEmoji(slug: string): string {
    const map: Record<string, string> = {
        vegetables: '🥬', fruits: '🍎', dairy: '🥛', snacks: '🍿',
        beverages: '🥤', staples: '🍚', spices: '🌶️', personal_care: '🧴',
        household: '🧹', bakery: '🍞', frozen: '🧊', baby_care: '👶',
        meat: '🥩', pulses: '🫘', oil: '🫒',
    };
    return map[slug] || '🛒';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        height: 280,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    imagePlaceholder: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    imagePlaceholderText: {
        fontSize: 60,
    },
    categoryBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: theme.colors.secondaryContainer,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        ...shadows.sm,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.secondary,
    },
    infoCard: {
        marginTop: -20,
        marginHorizontal: spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.lg,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    productName: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.onSurface,
        flex: 1,
        marginRight: 8,
    },
    stockBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    stockBadgeIn: {
        backgroundColor: '#E8F5E9',
    },
    stockBadgeOut: {
        backgroundColor: '#FFEBEE',
    },
    stockBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    stockBadgeTextIn: {
        color: '#2E7D32',
    },
    stockBadgeTextOut: {
        color: '#D32F2F',
    },
    unitText: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 4,
    },
    price: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    perUnit: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    descriptionSection: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        lineHeight: 22,
    },
    quickInfoRow: {
        flexDirection: 'row',
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    quickInfoCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    quickInfoEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    quickInfoLabel: {
        fontSize: 11,
        color: theme.colors.outlineVariant,
        fontWeight: '500',
    },
    quickInfoValue: {
        fontSize: 13,
        color: theme.colors.onSurface,
        fontWeight: '700',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
        gap: spacing.md,
        ...shadows.md,
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
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        ...shadows.sm,
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '700',
        minWidth: 32,
        textAlign: 'center',
        color: theme.colors.primary,
    },
    addToCartButton: {
        flex: 1,
        borderRadius: borderRadius.lg,
    },
    addToCartContent: {
        paddingVertical: 8,
    },
    addToCartLabel: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
