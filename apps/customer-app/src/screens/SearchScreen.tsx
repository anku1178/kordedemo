import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useCartStore } from '../stores/cartStore';
import { theme, shadows, spacing, borderRadius } from '../theme';
import type { Product } from 'shared-types';

export function SearchScreen() {
    const navigation = useNavigation<any>();
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
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('Product', { productId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.productEmojiCircle}>
                <Text style={styles.productEmoji}>🛍️</Text>
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productUnit}>{item.unit}</Text>
                <Text style={styles.productPrice}>₹{item.price}</Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => addItem(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.addButtonText}>+ ADD</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search for groceries..."
                    onChangeText={handleSearch}
                    value={query}
                    style={styles.searchBar}
                    autoFocus
                    elevation={2}
                />
            </View>

            {searched && products.length > 0 && (
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>{products.length} results</Text>
                </View>
            )}

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    searched ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyCircle}>
                                <Text style={styles.emptyEmoji}>🔍</Text>
                            </View>
                            <Text style={styles.emptyTitle}>No products found</Text>
                            <Text style={styles.emptySubtext}>Try searching for "{query}" differently</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyCircle}>
                                <Text style={styles.emptyEmoji}>🛒</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Search for groceries</Text>
                            <Text style={styles.emptySubtext}>Vegetables, fruits, dairy, snacks...</Text>
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
    searchContainer: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
    },
    searchBar: {
        borderRadius: borderRadius.lg,
        backgroundColor: theme.colors.surface,
    },
    resultsHeader: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xs,
    },
    resultsCount: {
        fontSize: 13,
        color: theme.colors.outlineVariant,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.md,
        ...shadows.sm,
    },
    productEmojiCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productEmoji: {
        fontSize: 22,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 1,
    },
    productUnit: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 64,
    },
    emptyCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyEmoji: {
        fontSize: 44,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        textAlign: 'center',
    },
});
