import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert, SafeAreaView} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

<MaterialIcons name="edit" size={24} color="gray" />



type HistoryEntry = {
    label: string;
    data: string;
    timestamp: string;
    source : 'gtext' | 'gsmart';
};

const HistoryScreen = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const router = useRouter();



    const handleCopy = (data: string) => {
        Clipboard.setStringAsync(data);

        const preview = data.length > 50 ? data.slice(0, 50) + '...' : data;
        Alert.alert('Copied to Clipboard', preview);
    };

    const handleEdit = (entry: HistoryEntry) => {
        const { data, source } = entry;

        if (source === 'gtext') {
            const [text] = data.split(',');
            router.replace({
                pathname: '/(tabs)/gtext',
                params: { text },
            });
        } else if (source === 'gsmart') {
            const [id1, part, lot, qty] = data.split(',');
            router.replace({
                pathname: '/(tabs)/gsmart',
                params: { id1, part, lot, qty },
            });
        }
    };
    useFocusEffect(
        useCallback(() => {
            const loadHistory = async () => {
                const stored = await AsyncStorage.getItem('qrHistory');
                const parsed = stored ? JSON.parse(stored) : [];
                setHistory(parsed);
                console.log('History loaded on focus:', parsed);
            };
            loadHistory();
        }, [])
    );


    //create an alert message
    const showConfirmClear = () => {
        Alert.alert(
            'Are you sure?',
            'This action cannot be undone. This will permanently delete your entire QR code history.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Continue',
                    style: 'destructive',
                    onPress:clearHistory,
                },
            ],
            { cancelable: true }
        );
    };


    const clearHistory = async () => {
        try {

            await AsyncStorage.removeItem('qrHistory');
            setHistory([]); // Clear local state

            // Force reload from storage after a short delay
            setTimeout(async () => {
                const stored = await AsyncStorage.getItem('qrHistory');
                const parsed = stored ? JSON.parse(stored) : [];
                setHistory(parsed);
                console.log('History reloaded after clear:', parsed);
            }, 100);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }

    };

    return (

        <SafeAreaView className="flex-1 bg-blue-100 items-center justify-center px-4">

            {/* White container with fixed height */}
            <View className="w-full max-w-md bg-white rounded-xl shadow-md p-4 h-[500px] justify-between">
                <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">History</Text>
                <Text className="text-gray-600 mb-6 text-center">A log of your scanned and generated QR codes.</Text>
                <ScrollView className="px-1 pt-6 pb-5 bg-white rounded-lg"contentContainerStyle={{ flexGrow: 1 }} >

                    {history.length === 0 && (
                        <View className="flex-1 items-center justify-center px-6 py-10">
                            <MaterialIcons name="history" size={48} color="#9CA3AF" className="mb-4" />
                            <Text className="text-lg font-semibold text-gray-500 mb-1">No History Yet</Text>
                            <Text className="text-sm text-gray-400 text-center">Scan or generate a QR code to see it here.</Text>
                        </View>
                    )}

                    {history.map((entry, index) => (
                        <View key={index} className="bg-white rounded-md px-4 py-5 mb-4 shadow-md border border-gray-200 flex-row items-start">

                            {/* 📄 Entry Content */}
                            <View className="w-full max-w-md mx-auto flex-1">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-base font-normal text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-md">{entry.label}</Text>
                                    <Text className="text-xs text-gray-500">{entry.timestamp}</Text>
                                </View>

                                <Text className="text-gray-700 text-sm mb-3">{entry.data}</Text>

                                {/* ✨ Action Icons */}
                                <View className="flex-row justify-end space-x-6">
                                    <TouchableOpacity onPress={() => handleCopy(entry.data)} className="flex-row items-end space-x-0.5">
                                        <MaterialIcons name="content-copy" size={15} color="#3B82F6" />
                                        <Text className="text-blue-600 text-xs  font-medium px-3">Copy</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleEdit(entry)} className="flex-row items-center space-x-1">
                                        <MaterialIcons name="edit" size={15} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs font-medium">Edit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}

                </ScrollView>

                <TouchableOpacity
                    onPress={showConfirmClear}
                    className="bg-red-500 px-2 py-3 rounded-l-md mt-8">
                    <Text className="text-white text-center font-semibold text-base">Clear History</Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>

    );
};

export default HistoryScreen;