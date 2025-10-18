import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './theme';


export default function SplashScreen() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={[colors.bgRoot, colors.lime]}          // keep your gradient
            start={{ x: 0.15, y: 0.1 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Safe padding */}
            <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 120, paddingBottom: 150 }}>
                {/* Top Left: Logo + small brand text */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <Image
                        source={require('../assets/images/qreroom.png')}  // put your logo at /assets/logo.png
                        style={{ width: 50, height: 100, marginRight: 10 }}
                        resizeMode="contain"
                    />
                    <Text style={{ color: '#E5E7EB', fontSize: 18, letterSpacing: 0.5 }}>WAREHOUSE QR</Text>
                </View>

                {/* Middle: Content (push down a bit for composition like the mock) */}
                <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                    <Text style={{ color: '#AEB3BA', fontSize: 40, marginBottom: 10 }}>Welcome</Text>

                    {/* Big headline with bold word */}
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 22,
                            lineHeight: 40,
                            fontWeight: '500',
                            maxWidth: 320,
                        }}
                    >
                        A QR Scan Generator app{'\n'}your{' '}
                        <Text style={{ fontWeight: '800' }}>Simple modern app for </Text>
                        {' '}E-Room Warehouse{'\n'}and easy to use!
                    </Text>
                </View>

                {/* Bottom controls area */}
                <View style={{ width: '100%' }}>
                    {/* Progress dots / bar */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 18,
                        }}
                    >
                        <View style={{ height: 4, width: 26, borderRadius: 999, backgroundColor: '#FFFFFF' }} />
                        <View style={{ height: 4, width: 16, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                        <View style={{ height: 4, width: 16, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    </View>

                    {/* Row: round arrow + (same) lime CTA aligned to the right */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Round arrow (decorative / optional) */}


                        {/* Keep original lime button (same color/shape/handler) */}
                        <TouchableOpacity
                            onPress={() => router.replace('..//(tabs)/gsmart')}
                            activeOpacity={0.85}
                            style={{
                                backgroundColor: colors.lime, // same lime
                                paddingVertical: 14,
                                paddingHorizontal: 32,
                                borderRadius: 28,
                                shadowColor: colors.lime,
                                shadowOpacity: 0.5,
                                shadowRadius: 10,
                            }}
                        >
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '700' }}>Get Started </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}
