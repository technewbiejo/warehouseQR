import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Alert,
    StyleSheet,
    Pressable,
    Animated,
    Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';


export default function QRScanner(): React.ReactElement {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const isFocused = useIsFocused();
    const router = useRouter();

    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isFocused) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animation, {
                        toValue: 200,
                        duration: 2000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animation, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            animation.stopAnimation();
            animation.setValue(0);
        }
    }, [isFocused]);

    const saveToHistory = async (
        data: string,
        label: string,
        source: 'gtext' | 'gsmart'
    ) => {
        const timestamp = new Date().toISOString();
        const entry = { label, data, timestamp, source };

        try {
            const stored = await AsyncStorage.getItem('qrHistory');
            const parsed = stored ? JSON.parse(stored) : [];
            const updated = [entry, ...parsed];
            await AsyncStorage.setItem('qrHistory', JSON.stringify(updated));
            console.log('Saved to history:', entry);
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            await Clipboard.setStringAsync(data);

            const isCommaSeparated = data.split(',').length === 4;
            const isLikelyURL = /^https?:\/\/|^www\./i.test(data);

            if (isCommaSeparated) {
                const [id1, part, lot, qty] = data.split(',');
                await saveToHistory(data, 'Scanned Smart QR', 'gsmart');
                router.replace({
                    pathname: '/(tabs)/gsmart',
                    params: { id1, part, lot, qty },
                });
            } else {
                await saveToHistory(data, 'QR scan', 'gtext');

                if (isLikelyURL) {
                    Alert.alert(
                        'Open Link?',
                        `This QR contains a link:\n${data}\n\nDo you want to open it in your browser?`,
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () =>
                                    router.replace({
                                        pathname: '/(tabs)/gtext',
                                        params: { text: data },
                                    }),
                            },
                            {
                                text: 'Open',
                                style: 'default',
                                onPress: () => Linking.openURL(data),
                            },
                        ],
                        { cancelable: true }
                    );
                } else {
                    router.replace({
                        pathname: '/(tabs)/gtext',
                        params: { text: data },
                    });

                    Alert.alert('QR Scanned & Copied ✅', `Content:\n${data}`);
                }
            }
        }
    };

    const handleCancel = () => {
        setScanned(false);
    };

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.centered}>
                <Text style={styles.message}>
                    We need camera access to scan QR codes
                </Text>
                <Pressable onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            {isFocused && (
                <CameraView
                    facing="back"
                    onBarcodeScanned={handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* Overlay content */}
            <View style={styles.overlay}>
                <Text style={styles.instruction}>
                    Align the QR code within the frame to scan
                </Text>

                <View style={styles.frame}>
                    <Animated.View
                        style={[
                            styles.scanLine,
                            { transform: [{ translateY: animation }] },
                        ]}
                    />
                </View>

                {scanned && (
                    <View style={styles.buttonRow}>
                        <Pressable onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel Scanning</Text>
                        </Pressable>

                        <Pressable onPress={() => setScanned(false)} style={styles.scanAgainButton}>
                            <Text style={styles.scanAgainText}>Scan Again</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    instruction: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    frame: {
        height: 250,
        width: 250,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#D5FF40',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: '#D5FF40',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 12,
    },
    cancelButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    scanAgainButton: {
        backgroundColor: '#D5FF40',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    scanAgainText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#D5FF40',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    message: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
});