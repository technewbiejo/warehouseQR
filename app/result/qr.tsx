import {View, Text, TouchableOpacity, Platform, PermissionsAndroid, Alert} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {useRef} from "react";
import * as MediaLibrary from 'expo-media-library';
import ViewShot, {captureRef} from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';




const QRScreen = () => {
    const { qrData } = useLocalSearchParams();

    const router = useRouter();
    const qrRef = useRef(null);



    return (

        <View className="flex-1 bg-blue-100 justify-center items-center px-4">
            <View className="bg-white rounded-xl w-full max-w-md p-6 shadow-md items-center">
                {/* Title */}
                <Text className="text-2xl font-bold text-gray-800 mb-2">Smart QR Code Result</Text>

                {/* Subtitle */}
                <Text className="text-center text-gray-600 mb-6">Here is your generated QR code.</Text>

                {/* QR Code */}
                {qrData && (
                    <ViewShot ref={qrRef} options={{ format: 'png', quality: 1.0 }}>
                        <View collapsable={false}>
                            <QRCode value={qrData as string} size={200} />
                        </View>
                    </ViewShot>
                )}

                {/* Raw Text */}
                <Text className="text-gray-700 mt-4 text-center">{qrData}</Text>

                {/* Buttons */}
                <View className="flex-row justify-center items-center gap-x-4 mt-4">
                    {/* Save Button */}
                    <TouchableOpacity  onPress={() =>
                        router.replace('../gsmart')} className="bg-purple-600 px-5 py-2 rounded-full">
                        <Text className="text-white font-semibold text-base">Return</Text>
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                        className="bg-gray-300 px-4 py-2 rounded-full flex-row items-center"
                        onPress={() =>
                            router.replace('../gsmart')}
                    >
                        <MaterialIcons name="edit" size={20} color="#374151" />
                        <Text className=" text-gray-800 font-semibold ">Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default QRScreen;