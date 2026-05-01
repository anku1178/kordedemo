import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Text, Card, Title, Paragraph, Searchbar, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { theme } from '../theme';
import type { Category, Product } from 'shared-types';

export function HomeScreen() {
    const navigation = useNavigation<any>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [catRes, prodRes] = await Promise.all([
            supabase.from('categories').select('*').order('sort_order'),
            supabase.from('products').select('*, category:categories(*)').eq('is_available', true).limit(10),
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (prodRes.data) setFeaturedProducts(prodRes.data as Product[]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const renderCategory = ({ item }: { item: Category }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Category', { categoryId: item.id, categoryName: item.name })}
        >
            <Card style={styles.categoryCard}>
                <Card.Content style={styles.categoryContent}>
                    <Text style={styles.categoryEmoji}>
                        {getCategoryEmoji(item.slug)}
                    </Text>
                    <Text style={styles.categoryName}>{item.name}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Product', { productId: item.id })}
        >
            <Card style={styles.productCard}>
                <Card.Content>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>₹{item.price}</Text>
                    </View>
                    <Text style={styles.productUnit}>{item.unit}</Text>
                    <View style={styles.stockRow}>
                        <View style={[styles.stockDot, { backgroundColor: item.is_available ? '#22c55e' : '#ef4444' }]} />
                        <Text style={[styles.stockText, { color: item.is_available ? '#16a34a' : '#dc2626' }]}>
                            {item.is_available ? 'In Stock' : 'Out of Stock'}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={featuredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                ListHeaderComponent={
                    <View>
                        {/* Search Bar */}
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Searchbar
                                placeholder="Search products..."
                                style={styles.searchBar}
                                value=""
                                editable={false}
                                onTouchStart={() => navigation.navigate('Search')}
                            />
                        </TouchableOpacity>

                        {/* Categories Section */}
                        <View style={styles.sectionHeader}>
                            <Title style={styles.sectionTitle}>Shop by Category</Title>
                            <TouchableOpacity onPress={() => { }}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={categories}
                            renderItem={renderCategory}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryList}
                        />

                        {/* Featured Products */}
                        <View style={styles.sectionHeader}>
                            <Title style={styles.sectionTitle}>Popular Products</Title>
                        </View>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

function getCategoryEmoji(slug: string): string {
    const emojiMap: Record<string, string> = {
        'grains-rice': '🍚',
        'pulses-lentils': '🫘',
        'spices-masala': '🌶️',
        'oil-ghee': '🫗',
        'flour-atta': '🌾',
        'sugar-jaggery': '🍬',
        'tea-coffee': '☕',
        'snacks-biscuits': '🍪',
        'dairy-products': '🧈',
        'soap-detergent': '🧹',
        'personal-care': '🧴',
        'beverages': '🥤',
        'pickles-sauce': '🫙',
        'noodles-pasta': '🍜',
        'canned-packaged': '🥫',
    };
    return emojiMap[slug] || '🛒';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingBottom: 16,
    },
    searchBar: {
        margin: 16,
        marginBottom: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.onSurface,
    },
    seeAll: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    categoryList: {
        paddingHorizontal: 12,
        gap: 8,
    },
    categoryCard: {
        width: 100,
        marginHorizontal: 4,
        borderRadius: 12,
    },
    categoryContent: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    categoryEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    categoryName: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        color: theme.colors.onSurface,
    },
    productRow: {
        paddingHorizontal: 12,
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
        marginBottom: 4,
        color: theme.colors.onSurface,
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
    productUnit: {
        fontSize: 11,
        color: theme.colors.outlineVariant,
        marginTop: 2,
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
});
