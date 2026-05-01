import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import { theme } from '../theme';

export function ProfileScreen() {
    const { user, updateProfile, signOut } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.full_name || '');

    const handleSave = async () => {
        await updateProfile({ full_name: name });
        setEditing(false);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.full_name || 'Customer'}</Text>
                <Text style={styles.phone}>{user?.email || ''}</Text>
            </View>

            <Divider />

            {/* Profile Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Details</Text>

                {editing ? (
                    <View style={styles.editForm}>
                        <TextInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <View style={styles.editActions}>
                            <Button
                                mode="outlined"
                                onPress={() => { setEditing(false); setName(user?.full_name || ''); }}
                                style={styles.editButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                buttonColor={theme.colors.primary}
                                style={styles.editButton}
                            >
                                Save
                            </Button>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setEditing(true)}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Name</Text>
                            <Text style={styles.detailValue}>{user?.full_name || 'Not set'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{user?.email || 'Not set'}</Text>
                        </View>
                        <Text style={styles.editHint}>Tap to edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Divider />

            {/* App Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>App Version</Text>
                    <Text style={styles.detailValue}>1.0.0</Text>
                </View>
            </View>

            {/* Sign Out */}
            <Button
                mode="outlined"
                onPress={signOut}
                textColor={theme.colors.error}
                style={styles.signOutButton}
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
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    phone: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    section: {
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.onSurface,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: theme.colors.outlineVariant,
    },
    detailValue: {
        fontSize: 14,
        color: theme.colors.onSurface,
        fontWeight: '500',
    },
    editHint: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 4,
    },
    editForm: {
        gap: 12,
    },
    input: {
        backgroundColor: theme.colors.surface,
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        flex: 1,
        borderRadius: 8,
    },
    signOutButton: {
        marginTop: 24,
        borderColor: theme.colors.error,
        borderRadius: 8,
    },
});
