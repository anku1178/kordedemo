import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
    displayLarge: { fontFamily: 'System', fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
    displayMedium: { fontFamily: 'System', fontSize: 45, lineHeight: 52, letterSpacing: 0 },
    displaySmall: { fontFamily: 'System', fontSize: 36, lineHeight: 44, letterSpacing: 0 },
    headlineLarge: { fontFamily: 'System', fontSize: 32, lineHeight: 40, letterSpacing: 0 },
    headlineMedium: { fontFamily: 'System', fontSize: 28, lineHeight: 36, letterSpacing: 0 },
    headlineSmall: { fontFamily: 'System', fontSize: 24, lineHeight: 32, letterSpacing: 0 },
    titleLarge: { fontFamily: 'System', fontSize: 22, lineHeight: 28, letterSpacing: 0 },
    titleMedium: { fontFamily: 'System', fontSize: 16, lineHeight: 24, letterSpacing: 0.15, fontWeight: '600' as const },
    titleSmall: { fontFamily: 'System', fontSize: 14, lineHeight: 20, letterSpacing: 0.1, fontWeight: '500' as const },
    bodyLarge: { fontFamily: 'System', fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
    bodyMedium: { fontFamily: 'System', fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
    bodySmall: { fontFamily: 'System', fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
    labelLarge: { fontFamily: 'System', fontSize: 14, lineHeight: 20, letterSpacing: 0.1, fontWeight: '500' as const },
    labelMedium: { fontFamily: 'System', fontSize: 12, lineHeight: 16, letterSpacing: 0.5, fontWeight: '500' as const },
    labelSmall: { fontFamily: 'System', fontSize: 11, lineHeight: 16, letterSpacing: 0.5, fontWeight: '500' as const },
};

export const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#4CAF50',
        primaryContainer: '#C8E6C9',
        secondary: '#FF9800',
        secondaryContainer: '#FFE0B2',
        tertiary: '#2196F3',
        tertiaryContainer: '#BBDEFB',
        error: '#F44336',
        errorContainer: '#FFCDD2',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        surfaceVariant: '#F5F5F5',
        outline: '#E0E0E0',
        outlineVariant: '#BDBDBD',
    },
    fonts: configureFonts({ config: fontConfig }),
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};
