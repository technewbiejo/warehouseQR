import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SplashScreen" />        {/* 👈 first screen */}
            <Stack.Screen name="(tabs)" />              {/* your tab navigation */}
        </Stack>
    );
}
