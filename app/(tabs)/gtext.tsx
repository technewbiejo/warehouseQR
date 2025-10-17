import React, { useState, useCallback } from 'react';
import {Text, View, TextInput, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {cls, GlassCard, InputShell} from '../theme';


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
            <View className={`${cls.screen} relative`}>
                <GlassCard>
                    <Text className={cls.heading}>Text to QR Code</Text>
                    <Text className={cls.subheading}>Enter any text to create a QR code.</Text>

                    <Text className={cls.label}>Your Text</Text>

                    <InputShell style={{ paddingVertical: 0 }}>
                        <TextInput
                            className={`p-4 h-40 max-h-60 text-white`}
                            placeholder="e.g., https://example.com"
                            placeholderTextColor="#9CA3AF"
                            value={text}
                            onChangeText={setText}
                            multiline
                            textAlignVertical="top"
                        />
                    </InputShell>

                    <TouchableOpacity className={`${cls.btn.primary} ${cls.mt6}`} onPress={handleGenerate}>
                        <Text className={cls.btnTextOnPrimary}>Generate QR Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className={`${cls.btn.secondary} ${cls.mt4}`} onPress={clearField}>
                        <Text className={cls.btnTextOnDark}>Clear field</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>
        </ScrollView>
    );
};


export default GText;