import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { theme, shadows, spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

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
                {/* Decorative top curve */}
                <View style={styles.topCurve}>
                    <View style={styles.curveInner} />
                </View>

                {/* Logo / Brand */}
                <View style={styles.brandContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🛒</Text>
                    </View>
                    <Text style={styles.brandName}>Korde Grocery</Text>
                    <Text style={styles.brandTagline}>Fresh groceries, easy pickup</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>
                        {isSignUp ? '🎉 Create Account' : '👋 Welcome Back'}
                    </Text>
                    <Text style={styles.formSubtitle}>
                        {isSignUp
                            ? 'Sign up to start ordering fresh groceries'
                            : 'Sign in to continue your grocery shopping'}
                    </Text>

                    {isSignUp && (
                        <TextInput
                            label="Full Name"
                            value={fullName}
                            onChangeText={(text) => { setFullName(text); setError(null); }}
                            style={styles.input}
                            mode="outlined"
                            left={<TextInput.Icon icon="account" />}
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
                        left={<TextInput.Icon icon="email" />}
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
                        left={<TextInput.Icon icon="lock" />}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                    />

                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                    )}
                    {success && (
                        <View style={styles.successBox}>
                            <Text style={styles.successText}>✅ {success}</Text>
                        </View>
                    )}

                    <Button
                        mode="contained"
                        onPress={isSignUp ? handleSignUp : handleSignIn}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        buttonColor={theme.colors.primary}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        onPress={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
                        style={styles.toggleContainer}
                    >
                        <Text style={styles.toggleText}>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        </Text>
                        <Text style={styles.toggleLink}>
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>
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
    topCurve: {
        height: 180,
        backgroundColor: theme.colors.primary,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    curveInner: {
        position: 'absolute',
        top: -60,
        left: -40,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    brandContainer: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 24,
        zIndex: 1,
    },
    logoCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        ...shadows.lg,
    },
    logoEmoji: {
        fontSize: 40,
    },
    brandName: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    brandTagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
    formCard: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.lg,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    input: {
        backgroundColor: theme.colors.surfaceVariant,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
    },
    errorBox: {
        backgroundColor: theme.colors.errorContainer,
        borderRadius: borderRadius.md,
        padding: spacing.sm + 2,
        marginBottom: spacing.sm,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 13,
        fontWeight: '500',
    },
    successBox: {
        backgroundColor: theme.colors.primaryContainer,
        borderRadius: borderRadius.md,
        padding: spacing.sm + 2,
        marginBottom: spacing.sm,
    },
    successText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: '500',
    },
    button: {
        borderRadius: borderRadius.lg,
        marginTop: spacing.sm,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.outline,
    },
    dividerText: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        fontWeight: '600',
        marginHorizontal: spacing.sm,
    },
    toggleContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    toggleLink: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
});
