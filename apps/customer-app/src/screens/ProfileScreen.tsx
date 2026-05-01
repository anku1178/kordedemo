import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { theme, shadows, spacing, borderRadius } from '../theme';

export function ProfileScreen() {
    const { user, updateProfile, signOut } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');

    const handleSave = async () => {
        await updateProfile({ full_name: name, phone });
        setEditing(false);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.headerCard}>
                <View style={styles.avatarOuter}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.name}>{user?.full_name || 'Customer'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
                <View style={styles.memberBadge}>
                    <Text style={styles.memberBadgeText}>🛒 Member</Text>
                </View>
            </View>

            {/* Profile Details */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    {!editing && (
                        <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
                            <Text style={styles.editButtonText}>✏️ Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {editing ? (
                    <View style={styles.editForm}>
                        <TextInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="account" />}
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                            label="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="phone" />}
                            keyboardType="phone-pad"
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <View style={styles.editActions}>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    setEditing(false);
                                    setName(user?.full_name || '');
                                    setPhone(user?.phone || '');
                                }}
                                style={styles.actionButton}
                                textColor={theme.colors.outlineVariant}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                buttonColor={theme.colors.primary}
                                style={styles.actionButton}
                            >
                                Save Changes
                            </Button>
                        </View>
                    </View>
                ) : (
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconCircle}>
                                <Text style={styles.detailIcon}>👤</Text>
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Name</Text>
                                <Text style={styles.detailValue}>{user?.full_name || 'Not set'}</Text>
                            </View>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconCircle}>
                                <Text style={styles.detailIcon}>✉️</Text>
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Email</Text>
                                <Text style={styles.detailValue}>{user?.email || 'Not set'}</Text>
                            </View>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconCircle}>
                                <Text style={styles.detailIcon}>📱</Text>
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Phone</Text>
                                <Text style={styles.detailValue}>{user?.phone || 'Not set'}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* App Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconCircle}>
                            <Text style={styles.detailIcon}>📱</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>App Version</Text>
                            <Text style={styles.detailValue}>1.0.0</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Sign Out */}
            <Button
                mode="outlined"
                onPress={signOut}
                textColor={theme.colors.error}
                style={styles.signOutButton}
                contentStyle={styles.signOutContent}
            >
                Sign Out
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    headerCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    avatarOuter: {
        marginBottom: spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    email: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: spacing.sm,
    },
    memberBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    memberBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.onSurface,
    },
    editButton: {
        backgroundColor: theme.colors.primaryContainer,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    detailsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    detailIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailIcon: {
        fontSize: 18,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: theme.colors.outlineVariant,
        marginBottom: 1,
    },
    detailValue: {
        fontSize: 15,
        color: theme.colors.onSurface,
        fontWeight: '600',
    },
    detailDivider: {
        height: 1,
        backgroundColor: theme.colors.outline,
        marginLeft: 56,
    },
    editForm: {
        gap: spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: borderRadius.md,
    },
    editActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    actionButton: {
        flex: 1,
        borderRadius: borderRadius.md,
    },
    signOutButton: {
        marginTop: spacing.sm,
        borderColor: theme.colors.error,
        borderRadius: borderRadius.lg,
    },
    signOutContent: {
        paddingVertical: 4,
    },
});
