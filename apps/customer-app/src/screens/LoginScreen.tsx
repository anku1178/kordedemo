import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { theme } from '../theme';

export function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signInWithPhone, verifyOtp, loading } = useAuthStore();

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const result = await signInWithPhone(formattedPhone);

        if (result.error) {
            setError(result.error);
        } else {
            setOtpSent(true);
            setError(null);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const result = await verifyOtp(formattedPhone, otp);

        if (result.error) {
            setError(result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo / Brand */}
                <View style={styles.brandContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>🛒</Text>
                    </View>
                    <Text style={styles.brandName}>Korde Grocery</Text>
                    <Text style={styles.brandTagline}>Fresh groceries, easy pickup</Text>
                </View>

                {/* Phone Input */}
                {!otpSent ? (
                    <View style={styles.formContainer}>
                        <TextInput
                            label="Phone Number"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                setError(null);
                            }}
                            keyboardType="phone-pad"
                            maxLength={10}
                            left={<TextInput.Affix text="+91" />}
                            style={styles.input}
                            mode="outlined"
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />
                        {error && <HelperText type="error">{error}</HelperText>}
                        <Button
                            mode="contained"
                            onPress={handleSendOtp}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            buttonColor={theme.colors.primary}
                        >
                            Send OTP
                        </Button>
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={styles.otpInfo}>
                            We've sent a 6-digit OTP to +91{phone}
                        </Text>
                        <TextInput
                            label="Enter OTP"
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text);
                                setError(null);
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            style={styles.input}
                            mode="outlined"
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />
                        {error && <HelperText type="error">{error}</HelperText>}
                        <Button
                            mode="contained"
                            onPress={handleVerifyOtp}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            buttonColor={theme.colors.primary}
                        >
                            Verify OTP
                        </Button>
                        <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); setError(null); }}>
                            <Text style={styles.resendText}>Change phone number</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 48,
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
        fontWeight: '700',
        color: theme.colors.primary,
    },
    brandTagline: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
        marginTop: 4,
    },
    formContainer: {
        gap: 12,
    },
    input: {
        backgroundColor: theme.colors.surface,
    },
    button: {
        marginTop: 8,
        paddingVertical: 6,
    },
    otpInfo: {
        textAlign: 'center',
        color: theme.colors.outlineVariant,
        fontSize: 14,
        marginBottom: 4,
    },
    resendText: {
        textAlign: 'center',
        color: theme.colors.primary,
        fontSize: 14,
        marginTop: 12,
    },
});
