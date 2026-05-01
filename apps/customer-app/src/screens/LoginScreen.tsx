import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { theme } from '../theme';

export function LoginScreen() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { signIn, signUp, loading } = useAuthStore();

    const handleSignIn = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        setError(null);
        const result = await signIn(email, password);
        if (result.error) {
            setError(result.error);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password || !fullName) {
            setError('Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setError(null);
        const result = await signUp(email, password, fullName);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess('Account created! You can now sign in.');
            setIsSignUp(false);
            setPassword('');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>
                    {/* Logo / Brand */}
                    <View style={styles.brandContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>🛒</Text>
                        </View>
                        <Text style={styles.brandName}>Korde Grocery</Text>
                        <Text style={styles.brandTagline}>Fresh groceries, easy pickup</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </Text>

                        {isSignUp && (
                            <TextInput
                                label="Full Name"
                                value={fullName}
                                onChangeText={(text) => { setFullName(text); setError(null); }}
                                style={styles.input}
                                mode="outlined"
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.primary}
                                autoCapitalize="words"
                            />
                        )}

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setError(null); setSuccess(null); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                            mode="outlined"
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={(text) => { setPassword(text); setError(null); setSuccess(null); }}
                            secureTextEntry
                            style={styles.input}
                            mode="outlined"
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />

                        {error && <HelperText type="error">{error}</HelperText>}
                        {success && <HelperText type="info" style={styles.successText}>{success}</HelperText>}

                        <Button
                            mode="contained"
                            onPress={isSignUp ? handleSignUp : handleSignIn}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            buttonColor={theme.colors.primary}
                            contentStyle={styles.buttonContent}
                        >
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </Button>

                        <TouchableOpacity
                            onPress={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
                            style={styles.toggleContainer}
                        >
                            <Text style={styles.toggleText}>
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                <Text style={styles.toggleLink}>
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 36,
    },
    brandName: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    brandTagline: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    formContainer: {
        gap: 4,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 12,
    },
    input: {
        backgroundColor: theme.colors.surface,
        marginBottom: 4,
    },
    button: {
        borderRadius: 12,
        marginTop: 12,
    },
    buttonContent: {
        paddingVertical: 6,
    },
    toggleContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    toggleText: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    toggleLink: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    successText: {
        color: theme.colors.primary,
    },
});
