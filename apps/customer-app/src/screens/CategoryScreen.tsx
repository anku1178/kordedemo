import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useCartStore } from '../stores/cartStore';
import { theme } from '../theme';
import type { Product } from 'shared-types';

export function CategoryScreen() {
    const route = useRoute<any>();
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
        <Card style={styles.productCard}>
            <Card.Content>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productUnit}>{item.unit}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.stockRow}>
                    <View style={[styles.stockDot, { backgroundColor: item.is_available ? '#22c55e' : '#ef4444' }]} />
                    <Text style={[styles.stockText, { color: item.is_available ? '#16a34a' : '#dc2626' }]}>
                        {item.is_available ? 'In Stock' : 'Out of Stock'}
                    </Text>
                </View>
            </Card.Content>
            <Card.Actions>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addItem(item)}
                >
                    <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
            </Card.Actions>
        </Card>
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
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products found in this category</Text>
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
        padding: 12,
    },
    productRow: {
        gap: 8,
    },
    productCard: {
        flex: 1,
        marginHorizontal: 4,
        marginBottom: 8,
        borderRadius: 12,
    },
    productName: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
        color: theme.colors.onSurface,
    },
    productUnit: {
        fontSize: 11,
        color: theme.colors.outlineVariant,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    productMrp: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        textDecorationLine: 'line-through',
    },
    addButton: {
        backgroundColor: theme.colors.primaryContainer,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addButtonText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 12,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    stockDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 48,
    },
    emptyText: {
        color: theme.colors.outlineVariant,
        fontSize: 14,
    },
});
