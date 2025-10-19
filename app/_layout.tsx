import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
    const [ready, setReady] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const flag = await AsyncStorage.getItem('hasOnboarded');
                setShowIntro(flag !== 'true'); // show splash only once
            } finally {
                setReady(true);
            }
        })();
    }, []);

    if (!ready) return null;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {showIntro && <Stack.Screen name="SplashScreen" />}
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}