import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { Text, Card, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { theme, shadows } from '../theme';
import type { Category, Product } from 'shared-types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CATEGORY_SIZE = (SCREEN_WIDTH - 48) / 3;

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
            activeOpacity={0.7}
        >
            <View style={styles.categoryCard}>
                <View style={styles.categoryEmojiCircle}>
                    <Text style={styles.categoryEmoji}>
                        {getCategoryEmoji(item.slug)}
                    </Text>
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Product', { productId: item.id })}
            activeOpacity={0.7}
            style={styles.productTouch}
        >
            <View style={styles.productCard}>
                {/* Product image placeholder */}
                <View style={styles.productImageArea}>
                    <Text style={styles.productImageEmoji}>🛍️</Text>
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.productMeta}>
                        <Text style={styles.productPrice}>₹{item.price}</Text>
                        <Text style={styles.productUnit}>{item.unit}</Text>
                    </View>
                    <View style={styles.stockBadge}>
                        <View style={[styles.stockDot, { backgroundColor: item.is_available ? '#43A047' : '#E53935' }]} />
                        <Text style={[styles.stockText, { color: item.is_available ? '#2E7D32' : '#C62828' }]}>
                            {item.is_available ? 'In Stock' : 'Out of Stock'}
                        </Text>
                    </View>
                </View>
            </View>
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
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.headerGreeting}>Welcome to 👋</Text>
                                <Text style={styles.headerTitle}>Korde Grocery</Text>
                            </View>
                        </View>

                        {/* Search Bar */}
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <View style={styles.searchWrapper}>
                                <Searchbar
                                    placeholder="Search for groceries..."
                                    style={styles.searchBar}
                                    value=""
                                    editable={false}
                                    onTouchStart={() => navigation.navigate('Search')}
                                    iconColor={theme.colors.outlineVariant}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Promo Banner */}
                        <View style={styles.banner}>
                            <View style={styles.bannerContent}>
                                <Text style={styles.bannerTitle}>🚚 Pick Up In Store</Text>
                                <Text style={styles.bannerSubtitle}>Order now, pick up at your convenience!</Text>
                            </View>
                        </View>

                        {/* Categories Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Shop by Category</Text>
                            <TouchableOpacity onPress={() => { }}>
                                <Text style={styles.seeAll}>See All →</Text>
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
                            <Text style={styles.sectionTitle}>Popular Products</Text>
                        </View>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerGreeting: {
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.primary,
        letterSpacing: -0.5,
    },
    searchWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchBar: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        ...shadows.sm,
    },
    banner: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: theme.colors.primary,
        ...shadows.md,
    },
    bannerContent: {
        padding: 20,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.onSurface,
        letterSpacing: -0.3,
    },
    seeAll: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    categoryList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    categoryCard: {
        width: CATEGORY_SIZE,
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 6,
        ...shadows.sm,
    },
    categoryEmojiCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryEmoji: {
        fontSize: 26,
    },
    categoryName: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        color: theme.colors.onSurface,
        lineHeight: 14,
    },
    productRow: {
        paddingHorizontal: 12,
        gap: 12,
    },
    productTouch: {
        flex: 1,
        maxWidth: '50%',
    },
    productCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        marginHorizontal: 4,
        marginBottom: 12,
        overflow: 'hidden',
        ...shadows.md,
    },
    productImageArea: {
        height: 100,
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
    },
    productImageEmoji: {
        fontSize: 36,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 6,
        lineHeight: 17,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    productUnit: {
        fontSize: 11,
        color: theme.colors.outlineVariant,
        fontWeight: '500',
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stockDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
