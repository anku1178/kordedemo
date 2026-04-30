// Single storage implementation using AsyncStorage
// AsyncStorage works on both web and native with Expo
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    getItem: (key: string): Promise<string | null> => AsyncStorage.getItem(key),
    setItem: (key: string, value: string): Promise<void> => AsyncStorage.setItem(key, value),
    removeItem: (key: string): Promise<void> => AsyncStorage.removeItem(key),
};
