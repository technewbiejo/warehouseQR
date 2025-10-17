import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { cls, GlassCard } from '../theme';
import { Dimensions } from 'react-native';
import { FlatList } from 'react-native';

const LIST_HEIGHT = Math.max(280, Math.floor(Dimensions.get('window').height * 0.48));

type HistoryEntry = {
    label: string;
    data: string;
    timestamp: string;
    source: 'gtext' | 'gsmart';
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
            router.replace({ pathname: '/(tabs)/gtext', params: { text } });
        } else if (source === 'gsmart') {
            const [id1, part, lot, qty] = data.split(',');
            router.replace({ pathname: '/(tabs)/gsmart', params: { id1, part, lot, qty } });
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

    const showConfirmClear = () => {
        Alert.alert(
            'Are you sure?',
            'This action cannot be undone. This will permanently delete your entire QR code history.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Continue', style: 'destructive', onPress: clearHistory },
            ],
            { cancelable: true }
        );
    };

    const clearHistory = async () => {
        try {
            await AsyncStorage.removeItem('qrHistory');
            setHistory([]);
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
        <SafeAreaView className={cls.screen}>
            <GlassCard>
                <Text className={cls.historyTitle}>History</Text>
                <Text className={cls.historySubtitle}>A log of your scanned and generated QR codes.</Text>

                {/* Scroll INSIDE the card */}
                <View style={{ height: LIST_HEIGHT, marginBottom: 12 }}>
                    <FlatList
                        data={history}
                        keyExtractor={(_, idx) => String(idx)}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 12 }}
                        ListEmptyComponent={
                            <View className={cls.historyEmptyWrap}>
                                <MaterialIcons name="history" size={48} color="#9CA3AF" />
                                <Text className={cls.historyEmptyTitle}>No History Yet</Text>
                                <Text className={cls.historyEmptySubtitle}>
                                    Scan or generate a QR code to see it here.
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View
                                className={cls.historyItem}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    borderColor: 'rgba(255,255,255,0.08)',
                                }}
                            >
                                <View className={cls.historyRowTop}>
                                    <View className={cls.historyChip}>
                                        <Text className={cls.historyChipText}>{item.label}</Text>
                                    </View>
                                    <Text className={cls.historyTime}>{item.timestamp}</Text>
                                </View>

                                <Text className={cls.historyData}>{item.data}</Text>

                                <View className={cls.historyActions}>
                                    <TouchableOpacity onPress={() => handleCopy(item.data)} className="flex-row items-center space-x-1">
                                        <MaterialIcons name="content-copy" size={16} color="#D5FF40" />

                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleEdit(item)} className="flex-row items-center ml-4 space-x-1">
                                        <MaterialIcons name="edit" size={16} color="#D5FF40" />
                                        {/*
                                        <Text className={cls.actionEditText}>Edit</Text>
                                        */}

                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </View>

                <TouchableOpacity onPress={showConfirmClear} className={cls.dangerBar}>
                    <View className="flex-row items-center justify-center">
                        <MaterialIcons name="delete-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text className={cls.dangerBarText}>Clear History</Text>
                    </View>
                </TouchableOpacity>
            </GlassCard>
        </SafeAreaView>
    );
};

export default HistoryScreen;
