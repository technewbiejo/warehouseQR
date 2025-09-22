import React, { useState, useCallback } from 'react';
import {Text, View, TextInput, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


const GText = () => {

    const router = useRouter();
    const { qrData,reset,text : rawText } = useLocalSearchParams();
    const[text, setText] = useState('');

    const pText = typeof rawText === 'string' ? rawText : '';
    const clearField = async () => {
        setText('');
    }
    // Generate QR and navigate to qrtext.tsx
    const handleGenerate = async () => {

        const qrData = text;
        const timestamp = new Date().toLocaleString();
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

        router.push({ pathname: '/result/qrtext', params: { qrData } });

        const newEntry = {
            label: 'Text QR',
            data: `${text}`,
            timestamp: new Date().toLocaleString(),
            source: 'gtext', // or 'gsmart'
        };

        try {
            const existing = await AsyncStorage.getItem('qrHistory');
            const history = existing ? JSON.parse(existing) : [];
            history.unshift(newEntry); // Add new entry to the top
            await AsyncStorage.setItem('qrHistory', JSON.stringify(history));
            console.log('Saved to history:', newEntry);



            router.push({
                pathname: '/result/qrtext',
                params: { qrData, text},
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
            } else if(pText) {
                setText(pText);
            }
        }, [reset, pText])
    );

    // @ts-ignore
    return (

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 justify-center items-center px-4 relative bg-blue-100">
                {/* White container */}
                <View className="bg-white rounded-xl w-full max-w-md p-6 shadow-md min-h-[400px]">
                    {/* Title */}
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                        Text to QR Code
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-center text-gray-600 mb-6">
                        Enter any text to create a QR code.
                    </Text>

                    {/* Label */}
                    <Text className="text-gray-700 font-semibold mb-2">Your Text</Text>

                    {/* Input */}
                    <TextInput
                        className=" border border-gray-300 rounded-lg p-4 h-40 max-h-60  text-gray-800 bg-blue-100 "

                        placeholder="e.g., https://example.com"
                        placeholderTextColor="#9CA3AF"
                        value={text}
                        onChangeText={setText}
                        multiline
                        textAlignVertical="top"

                    />

                    {/* Button */}
                    <TouchableOpacity className="bg-purple-600 rounded-lg py-3 mt-6" onPress={handleGenerate}>
                        <Text className="text-white text-center font-semibold text-base">
                            Generate QR Code
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-blue-600 rounded-lg py-3 mt-4" onPress={clearField}>
                        <Text className="text-white text-center font-semibold text-base">Clear field</Text>
                    </TouchableOpacity>
                </View>
            </View>


        </ScrollView>

    );
};


export default GText;