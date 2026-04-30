import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useCartStore } from './src/stores/cartStore';

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <View style={{ flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fef2f2' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 10 }}>
                        Runtime Error
                    </Text>
                    <ScrollView style={{ maxHeight: 400 }}>
                        <Text style={{ fontFamily: 'monospace', color: '#dc2626', fontSize: 12 }}>
                            {this.state.error.message}
                        </Text>
                        {'\n\n'}
                        <Text style={{ fontFamily: 'monospace', color: '#999', fontSize: 10 }}>
                            {this.state.error.stack}
                        </Text>
                    </ScrollView>
                </View>
            );
        }
        return this.props.children;
    }
}

function AppContent() {
    const initialize = useAuthStore((state) => state.initialize);
    const hydrateCart = useCartStore((state) => state.hydrate);

    useEffect(() => {
        initialize();
        hydrateCart();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <AppNavigator />
        </SafeAreaProvider>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}
