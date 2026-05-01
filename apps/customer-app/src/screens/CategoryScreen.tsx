import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useCartStore } from '../stores/cartStore';
import { theme, shadows, spacing, borderRadius } from '../theme';
import type { Product } from 'shared-types';

export function CategoryScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { categoryId, categoryName } = route.params;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        loadProducts();
    }, [categoryId]);

    const loadProducts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', categoryId)
            .eq('is_available', true)
            .order('name');

        if (data) setProducts(data as Product[]);
        setLoading(false);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('Product', { productId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.productImageArea}>
                <Text style={styles.productEmoji}>🛍️</Text>
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productUnit}>{item.unit}</Text>
                <View style={styles.productBottom}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addItem(item)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.addButtonText}>+ ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={loadProducts}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyCircle}>
                            <Text style={styles.emptyEmoji}>🔍</Text>
                        </View>
                        <Text style={styles.emptyText}>No products found</Text>
                        <Text style={styles.emptySubtext}>in this category</Text>
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
        padding: spacing.sm,
        paddingBottom: spacing.xl,
    },
    productRow: {
        gap: spacing.sm,
    },
    productCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        overflow: 'hidden',
        ...shadows.sm,
    },
    productImageArea: {
        height: 100,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productEmoji: {
        fontSize: 36,
    },
    productInfo: {
        padding: spacing.sm + 2,
    },
    productName: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 2,
    },
    productUnit: {
        fontSize: 11,
        color: theme.colors.outlineVariant,
        marginBottom: spacing.sm,
    },
    productBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 11,
        letterSpacing: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 64,
    },
    emptyCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    emptyEmoji: {
        fontSize: 36,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.onSurface,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
});
