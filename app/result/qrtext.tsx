import {View, Text, TouchableOpacity, Platform, PermissionsAndroid, Alert} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {useRef} from "react";
import ViewShot, {captureRef} from 'react-native-view-shot';


const Qrtext = () => {
    const { qrData } = useLocalSearchParams();

    const router = useRouter();
    const qrRef = useRef(null);

    return(

        <View className="flex-1 bg-blue-100 justify-center items-center px-4">

            <View className="bg-white rounded-xl w-full max-w-md p-6 shadow-md items-center">
                <Text className="text-center text-gray-600 mb-6">The QR code has been generated successfully.</Text>
                <Text className="text-center text-gray-600 mb-6">Here is your generated code</Text>

                {qrData && (
                    <ViewShot ref={qrRef} options={{ format: 'png', quality: 1.0 }}>
                        <View collapsable={false}>
                            <QRCode   value={qrData as string} size={250} />
                        </View>
                    </ViewShot>
                )}

                <Text className="text-gray-700 mt-4 text-center">{qrData}</Text>
                <View className="flex-row justify-center items-center gap-x-4 mt-4">
                    <TouchableOpacity  onPress={() =>
                        router.replace('/(tabs)/gtext')}
                                      className="bg-purple-600 px-4 py-2 rounded-full flex-row items-center">
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                        <Text className="text-white">Return</Text>
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                        className="bg-gray-300 px-4 py-2 rounded-full flex-row items-center"
                        onPress={() =>
                            router.replace('/(tabs)/gtext')}
                    >
                        <MaterialIcons name="edit" size={20} color="#374151" />
                        <Text className=" text-gray-800 font-semibold ml-2">Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
};

export default Qrtext;