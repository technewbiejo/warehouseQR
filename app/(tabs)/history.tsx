import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Dimensions, FlatList } from 'react-native';
import { cls, GlassCard } from '../theme';

const LIST_HEIGHT = Math.max(280, Math.floor(Dimensions.get('window').height * 0.48));

type HistoryEntry = {
    label: string;
    data: string;
    timestamp: string;
    source: 'gtext' | 'gsmart' | 'icbin';
};

const HistoryScreen = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [search, setSearch] = useState(''); //  search text
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
        } else if (source === 'icbin') {
            // Format: DEVICE/ERP/MARKING/QUANTITY/TESTPROGRAM/BIN/DATE[/SERIAL]
            const [device, erp, marking, quantity, testProgram, binValue, dateValue, serialValue] = data.split('/');
            const params: Record<string, string> = {
                device: device ?? '',
                erp: erp ?? '',
                marking: marking ?? '',
                quantity: quantity ?? '',
                testProgram: testProgram ?? '',
                bin: binValue ?? '',
                date: dateValue ?? '',
            };
            if (serialValue) {
                params.serial = serialValue;
            }
            router.replace({
                pathname: '/(tabs)/icbin',
                params,
            });
        }
    };

    const handleDelete = (entry: HistoryEntry) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this history entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Find and remove the entry from history
                            const updatedHistory = history.filter((item) => {
                                // Match by timestamp and data to ensure uniqueness
                                return !(item.timestamp === entry.timestamp && item.data === entry.data);
                            });

                            // Update AsyncStorage
                            await AsyncStorage.setItem('qrHistory', JSON.stringify(updatedHistory));

                            // Update state
                            setHistory(updatedHistory);
                            console.log('Entry deleted from history');
                        } catch (error) {
                            console.error('Failed to delete entry:', error);
                            Alert.alert('Error', 'Failed to delete entry. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
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

    const normalizedSearch = search.trim().toLowerCase();
    const filteredHistory = !normalizedSearch
        ? history                          // 👉 if search empty, show ALL
        : history.filter((entry) => {
            if (entry.source === 'gsmart') {
                // data looks like: id1,part,lot,qty
                const [, part] = entry.data.split(',');
                return part?.toLowerCase().includes(normalizedSearch);
            }
            // you can choose:
            // return true;   // keep non-gsmart entries even when searching
            return false;     // or hide non-gsmart entries while searching
        });

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
                <Text className={cls.historyTitle }>History</Text>
                <Text className={cls.historySubtitle}>A log of your scanned and generated QR codes.</Text>

                {/* 🔍 Search Bar */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginTop: 12,
                        marginBottom: 10,
                    }}
                >
                    <MaterialIcons
                        name="search"
                        size={18}
                        color="#9CA3AF"
                        style={{ marginRight: 8 }}
                    />
                    <TextInput
                        style={{ flex: 1, color: 'white', paddingVertical: 4 }}
                        placeholder="Search ID Part Number..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}   // 👈 this updates search state
                        autoCapitalize="characters"
                    />
                </View>

                {/* Scroll INSIDE the card */}
                <View style={{ height: LIST_HEIGHT, marginBottom: 12 }}>
                    <FlatList
                        data={filteredHistory}
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

                                    <TouchableOpacity onPress={() => handleDelete(item)} className="flex-row items-center ml-4 space-x-1">
                                        <MaterialIcons name="delete-outline" size={16} color="#D5FF40" />
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
