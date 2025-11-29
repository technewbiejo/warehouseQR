import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { MaterialIcons } from '@expo/vector-icons';

const QRBinScreen = () => {
    const params = useLocalSearchParams();
    const qrData = typeof params.qrData === 'string' ? params.qrData : '';

    const router = useRouter();
    const qrRef = useRef<ViewShot>(null);

    return (
        <View className="flex-1 bg-[#0C0D11] justify-center items-center px-4">
            <View className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl items-center">
                <Text className="text-2xl font-bold text-gray-900 mb-1">IC Bin QR Code</Text>
                <Text className="text-center text-gray-600 mb-6">
                    Here is the QR generated from your IC Bin entry.
                </Text>

                {qrData ? (
                    <ViewShot ref={qrRef} options={{ format: 'png', quality: 2.0 }}>
                        <View collapsable={false}>
                            <QRCode value={qrData} size={260} />
                        </View>
                    </ViewShot>
                ) : (
                    <View className="rounded-xl border border-dashed border-gray-300 px-6 py-8 mb-4">
                        <Text className="text-gray-400 text-center">
                            QR data missing. Please regenerate from the IC tab.
                        </Text>
                    </View>
                )}

                <Text className="text-gray-700 mt-4 mb-4 text-center break-words">{qrData}</Text>

                <View className="flex-row justify-center items-center gap-x-4 mt-6">
                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/icbin')}
                        className="bg-[#D5FF40] px-4 py-2 rounded-full flex-row items-center"
                    >
                        <MaterialIcons name="arrow-back" size={20} color="black" />
                        <Text className="text-black font-semibold text-base ml-1">Return</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-200 px-4 py-2 rounded-full flex-row items-center"
                        onPress={() =>
                            router.replace({
                                pathname: '/(tabs)/icbin',
                                params,
                            })
                        }
                    >
                        <MaterialIcons name="edit" size={20} color="#374151" />
                        <Text className="text-gray-900 font-semibold ml-2">Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default QRBinScreen;


