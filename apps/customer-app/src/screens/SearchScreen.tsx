import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { useCartStore } from '../stores/cartStore';
import { theme } from '../theme';
import type { Product } from 'shared-types';

export function SearchScreen() {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [searched, setSearched] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    const handleSearch = useCallback(async (text: string) => {
        setQuery(text);
        if (text.length < 2) {
            setProducts([]);
            setSearched(false);
            return;
        }

        setSearched(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('is_available', true)
            .ilike('name', `%${text}%`)
            .limit(50);

        if (data) setProducts(data as Product[]);
    }, []);

    const renderProduct = ({ item }: { item: Product }) => (
        <Card style={styles.productCard}>
            <Card.Content style={styles.productContent}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productUnit}>{item.unit}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>₹{item.price}</Text>
                        {item.mrp > item.price && (
                            <Text style={styles.productMrp}>₹{item.mrp}</Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addItem(item)}
                >
                    <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search for groceries..."
                onChangeText={handleSearch}
                value={query}
                style={styles.searchBar}
                autoFocus
            />
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    searched ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🔍</Text>
                            <Text style={styles.emptyText}>No products found for "{query}"</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🛒</Text>
                            <Text style={styles.emptyText}>Search for groceries, snacks, dairy...</Text>
                        </View>
                    )
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
    searchBar: {
        margin: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    productCard: {
        marginBottom: 8,
        borderRadius: 12,
    },
    productContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.onSurface,
        marginBottom: 2,
    },
    productUnit: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    productPrice: {
        fontSize: 16,
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
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 48,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        color: theme.colors.outlineVariant,
        fontSize: 14,
        textAlign: 'center',
    },
});
