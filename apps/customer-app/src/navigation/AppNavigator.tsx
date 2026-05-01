import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, IconButton } from 'react-native-paper';
import { theme } from '../theme';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { ProductScreen } from '../screens/ProductScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoginScreen } from '../screens/LoginScreen';

import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

export type RootStackParamList = {
    Home: undefined;
    Category: { categoryId: string; categoryName: string };
    Product: { productId: string };
    Search: undefined;
    Cart: undefined;
    Checkout: undefined;
    OrderTracking: { orderId: string };
    OrderHistory: undefined;
    Login: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeTabs() {
    const itemCount = useCartStore((state) => state.getItemCount());

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.outlineVariant,
                tabBarStyle: {
                    paddingBottom: 8,
                    paddingTop: 4,
                    height: 64,
                    backgroundColor: theme.colors.surface,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <IconButton icon="home" iconColor={color} size={24} />,
                }}
            />
            <Tab.Screen
                name="SearchTab"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Search',
                    tabBarIcon: ({ color }) => <IconButton icon="magnify" iconColor={color} size={24} />,
                }}
            />
            <Tab.Screen
                name="CartTab"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color }) => (
                        <IconButton icon="cart" iconColor={color} size={24} />
                    ),
                    tabBarBadge: itemCount > 0 ? itemCount : undefined,
                }}
            />
            <Tab.Screen
                name="OrdersTab"
                component={OrderHistoryScreen}
                options={{
                    tabBarLabel: 'Orders',
                    tabBarIcon: ({ color }) => <IconButton icon="receipt" iconColor={color} size={24} />,
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <IconButton icon="account" iconColor={color} size={24} />,
                }}
            />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    const { user, initialized } = useAuthStore();

    if (!initialized) {
        return null; // Show splash screen
    }

    const showApp = !!user;

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: theme.colors.primary },
                        headerTintColor: '#FFFFFF',
                        headerTitleStyle: { fontWeight: '600' },
                    }}
                >
                    {showApp ? (
                        <>
                            <Stack.Screen
                                name="Home"
                                component={HomeTabs}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="Category"
                                component={CategoryScreen}
                                options={({ route }) => ({ title: route.params.categoryName })}
                            />
                            <Stack.Screen
                                name="Product"
                                component={ProductScreen}
                                options={{ title: 'Product Details' }}
                            />
                            <Stack.Screen
                                name="Search"
                                component={SearchScreen}
                                options={{ title: 'Search Products' }}
                            />
                            <Stack.Screen
                                name="Cart"
                                component={CartScreen}
                                options={{ title: 'Your Cart' }}
                            />
                            <Stack.Screen
                                name="Checkout"
                                component={CheckoutScreen}
                                options={{ title: 'Checkout' }}
                            />
                            <Stack.Screen
                                name="OrderTracking"
                                component={OrderTrackingScreen}
                                options={({ route }) => ({ title: `Order ${route.params.orderId}` })}
                            />
                            <Stack.Screen
                                name="OrderHistory"
                                component={OrderHistoryScreen}
                                options={{ title: 'My Orders' }}
                            />
                            <Stack.Screen
                                name="Profile"
                                component={ProfileScreen}
                                options={{ title: 'My Profile' }}
                            />
                        </>
                    ) : (
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
