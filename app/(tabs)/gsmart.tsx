import {useCallback, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert} from 'react-native';
import {useFocusEffect, useRouter} from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';


const GSmart = () => {

    const router = useRouter();
    //const { qrData } = useLocalSearchParams();

    const [id1, setId1] = useState('');
    const [part, setPart] = useState('');
    const [lot, setLot] = useState('');
    const [qty, setQty] = useState('');

    const { reset, id1: rawId1, part: rawPart, lot: rawLot, qty: rawQty } = useLocalSearchParams();

    const pId1 = typeof rawId1 === 'string' ? rawId1 : '';
    const pPart = typeof rawPart === 'string' ? rawPart : '';
    const pLot = typeof rawLot === 'string' ? rawLot : '';
    const pQty = typeof rawQty === 'string' ? rawQty : '';


    const clearField = async () => {
        setId1('');
        setPart('');
        setLot('');
        setQty('');
    }

    // Generate QR and navigate to qr.tsx
    const handleGenerate = async () => {
        const qrData = `${id1},${part},${lot},${qty}`;
        const timestamp = new Date().toLocaleString();
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

        router.push({ pathname: '/result/qr', params: { qrData } });

        const newEntry = {
            label: 'Smart QR',
            data: `${id1},${part},${lot},${qty}`,
            timestamp: new Date().toLocaleString(),
            source: 'gsmart', // or 'gtext'
        };
        try {
            const existing = await AsyncStorage.getItem('qrHistory');
            const history = existing ? JSON.parse(existing) : [];
            history.unshift(newEntry); // Add new entry to the top
            await AsyncStorage.setItem('qrHistory', JSON.stringify(history));
            console.log('Saved to history:', newEntry);

            router.push({
                pathname: '/result/qr',
                params: { qrData, id1, part, lot, qty },
            });
        } catch (error) {
            console.error('Failed to save history:', error);


        }

    };

    // Reset form if reset param is true
    useFocusEffect(
        useCallback(() => {
            if (reset === 'true') {
                clearField();
            } else if (pId1||pPart||pLot||pQty)  {
                setId1(pId1);
                setPart(pPart);
                setLot(pLot);
                setQty(pQty);
            }
        }, [reset, pId1, pPart, pLot, pQty])
    );


    {/* customize style input fields */}
    return (

        <View className="flex-1 bg-blue-100 justify-center items-center px-4">
            <View className="bg-white rounded-xl w-full max-w-md p-4 shadow-md min-h-[400px]">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-2">Smart Scan QR Code</Text>
                <Text className="text-center text-gray-600 mb-6">Enter structured data to generate a QR code.</Text>

                {/* Input Fields */}
                {/* ID code #1 */}
                <View className="space-y-4">
                    <Text className="text-gray-700 mb-1">ID Code #1</Text>
                    <TextInput
                        className=" bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800"
                        placeholder="ID Code #1"
                        placeholderTextColor="#9CA3AF"
                        value={id1}
                        onChangeText={setId1} />

                    <Text className="text-gray-700 mb-1">Part Number</Text>
                    <TextInput
                        className="bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800"
                        placeholder="Part Number" value={part}
                        placeholderTextColor="#9CA3AF"
                        onChangeText={setPart}
                    />

                    <Text className="text-gray-700 mb-1">Lot Code</Text>
                    <TextInput className="bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800" placeholder="Lot ID"  placeholderTextColor="#9CA3AF" value={lot} onChangeText={setLot} keyboardType="numeric" />

                    <Text className="text-gray-700 mb-1">Quantity</Text>
                    <TextInput className="bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800"  placeholder="Quantity"   placeholderTextColor="#9CA3AF" value={qty} onChangeText={setQty} keyboardType="numeric" />
                </View>

                <TouchableOpacity className="bg-purple-600 rounded-lg py-3 mt-6" onPress={handleGenerate}>
                    <Text className="text-white text-center font-semibold text-base">Generate QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-blue-600 rounded-lg py-3 mt-4" onPress={clearField}>
                    <Text className="text-white text-center font-semibold text-base">Clear field</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default GSmart;