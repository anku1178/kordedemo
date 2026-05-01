import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useCartStore } from '../stores/cartStore';
import { theme } from '../theme';
import type { Product } from 'shared-types';

export function ProductScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { productId } = route.params;
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
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
        navigation.navigate('Cart');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Product Image Placeholder */}
                <View style={styles.imageContainer}>
                    {product.image_url ? (
                        <Text>Image</Text>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>🛒</Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>

                    {product.category && (
                        <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
                            {product.category.name}
                        </Chip>
                    )}

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{product.price}</Text>
                    </View>

                    <Text style={styles.unit}>Unit: {product.unit}</Text>

                    {product.description && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionLabel}>Description</Text>
                            <Text style={styles.description}>{product.description}</Text>
                        </View>
                    )}

                    <View style={styles.stockInfo}>
                        <Text style={[
                            styles.stockText,
                            { color: product.is_available ? theme.colors.primary : theme.colors.error }
                        ]}>
                            {product.is_available ? '✓ In Stock' : '✕ Out of Stock'}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(quantity + 1)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <Button
                    mode="contained"
                    onPress={handleAddToCart}
                    style={styles.addToCartButton}
                    buttonColor={theme.colors.primary}
                    disabled={!product.is_available}
                >
                    ADD TO CART • ₹{(product.price * quantity).toFixed(2)}
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
    imageContainer: {
        height: 250,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 48,
    },
    infoContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 8,
    },
    categoryChip: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        backgroundColor: theme.colors.secondaryContainer,
    },
    categoryChipText: {
        fontSize: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    unit: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        marginBottom: 16,
    },
    descriptionContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        lineHeight: 20,
    },
    stockInfo: {
        marginTop: 8,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
        gap: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    quantityButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        minWidth: 24,
        textAlign: 'center',
    },
    addToCartButton: {
        flex: 1,
        paddingVertical: 6,
    },
});
