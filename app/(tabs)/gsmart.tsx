import { useCallback, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const pad2 = (n: number) => n.toString().padStart(2, '0');
const toYYMMDD = (d: Date) => `${pad2(d.getFullYear() % 100)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;

const GSmart = () => {
    const router = useRouter();

    const [id1, setId1] = useState('');
    const [part, setPart] = useState('');
    // NEW: split Lot Code into prefix + date (YYMMDD)
    const [lotPrefix, setLotPrefix] = useState(''); // 4 digits
    const [lotDate, setLotDate] = useState('');     // YYMMDD (6 digits)
    const [qty, setQty] = useState('');

    // Date picker state
    const [showPicker, setShowPicker] = useState(false);
    const [pickerDate, setPickerDate] = useState<Date>(new Date());

    const { reset, id1: rawId1, part: rawPart, lot: rawLot, qty: rawQty } = useLocalSearchParams();
    const pId1 = typeof rawId1 === 'string' ? rawId1 : '';
    const pPart = typeof rawPart === 'string' ? rawPart : '';
    const pLot = typeof rawLot === 'string' ? rawLot : '';
    const pQty = typeof rawQty === 'string' ? rawQty : '';

    const clearField = async () => {
        setId1('');
        setPart('');
        setLotPrefix('');
        setLotDate('');
        setQty('');
    };

    const digitsOnly = (s: string) => s.replace(/\D+/g, '');

    // Keep inputs constrained
    const handlePrefixChange = (s: string) => setLotPrefix(digitsOnly(s).slice(0, 4));
    const handleDateChange = (s: string) => setLotDate(digitsOnly(s).slice(0, 6));

    // Combine for QR
    const getCombinedLot = () => {
        if (lotPrefix && lotDate) return `${lotPrefix}-${lotDate}`;
        return ''; // only combine when both present
    };

    // Generate QR and navigate to qr.tsx
    const handleGenerate = async () => {
        // Basic validation for new fields
        if (!/^\d{4}$/.test(lotPrefix)) {
            Alert.alert('Lot Prefix', 'Please enter a 4-digit lot prefix.');
            return;
        }
        if (!/^\d{6}$/.test(lotDate)) {
            Alert.alert('Lot Date', 'Please enter a date in YYMMDD format.');
            return;
        }

        const lotCombined = getCombinedLot();
        const qrData = `${id1},${part},${lotCombined},${qty}`;

        await new Promise((resolve) => setTimeout(resolve, 100)); // small delay

        // Save to history then navigate
        const newEntry = {
            label: 'Smart QR',
            data: qrData,
            timestamp: new Date().toLocaleString(),
            source: 'gsmart',
        };
        try {
            const existing = await AsyncStorage.getItem('qrHistory');
            const history = existing ? JSON.parse(existing) : [];
            history.unshift(newEntry);
            await AsyncStorage.setItem('qrHistory', JSON.stringify(history));
            router.push({
                pathname: '/result/qr',
                params: { qrData, id1, part, lot: lotCombined, qty },
            });
        } catch (error) {
            console.error('Failed to save history:', error);
            // Navigate anyway
            router.push({
                pathname: '/result/qr',
                params: { qrData, id1, part, lot: lotCombined, qty },
            });
        }
    };

    // Reset form if reset param is true OR preload params
    useFocusEffect(
        useCallback(() => {
            if (reset === 'true') {
                clearField();
            } else if (pId1 || pPart || pLot || pQty) {
                setId1(pId1);
                setPart(pPart);
                setQty(pQty);
                // If incoming lot already combined, split it; else try to parse as raw
                const m = typeof pLot === 'string' ? pLot.match(/^(\d{4})-(\d{6})$/) : null;
                if (m) {
                    setLotPrefix(m[1]);
                    setLotDate(m[2]);
                } else {
                    // fallback: if they passed a 10-char (4+6) without hyphen
                    const digits = digitsOnly(pLot);
                    if (digits.length === 10) {
                        setLotPrefix(digits.slice(0, 4));
                        setLotDate(digits.slice(4, 10));
                    } else {
                        setLotPrefix('');
                        setLotDate('');
                    }
                }
            }
        }, [reset, pId1, pPart, pLot, pQty])
    );

    // Handle native date picker selection
    const onChangePicker = (_: any, selected?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (selected) {
            setPickerDate(selected);
            setLotDate(toYYMMDD(selected));
        }
    };

    return (
        <View className="flex-1 bg-blue-100 justify-center items-center px-4">
            <View className="bg-white rounded-xl w-full max-w-md p-4 shadow-md min-h-[460px]">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-2">Smart Scan QR Code</Text>
                <Text className="text-center text-gray-600 mb-6">Enter structured data to generate a QR code.</Text>

                <View className="space-y-4">
                    {/* ID code #1 */}
                    <Text className="text-gray-700 mb-1">ID Code</Text>
                    <TextInput
                        className="bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800"
                        placeholder="ID Code #1"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="characters"
                        value={id1}
                        onChangeText={(text) => setId1(text.toUpperCase())}
                    />
                    {/* Part Number */}
                    <Text className="text-gray-700 mb-1">Part Number</Text>
                    <TextInput
                        className="bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800"
                        placeholder="Part Number"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="characters"
                        value={part}
                        onChangeText={(text) => setPart(text.toUpperCase())}
                    />
                    {/* NEW: Lot Code split */}
                    <Text className="text-gray-700 mb-1">Lot Code</Text>
                    {/* Prefix & Date row */}
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-gray-600 mb-1">Prefix (4 digits)</Text>
                            <TextInput
                                className="bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800"
                                placeholder="e.g. 1811"
                                placeholderTextColor="#9CA3AF"
                                value={lotPrefix}
                                onChangeText={handlePrefixChange}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>

                        <View className="flex-1">
                            <Text className="text-gray-600 mb-1">Date (YYMMDD)</Text>
                            <View className="flex-row items-center bg-blue-100 border rounded-lg px-3">
                                <TextInput
                                    className="flex-1 py-4 text-base text-gray-800"
                                    placeholder="e.g. 250515"
                                    placeholderTextColor="#9CA3AF"
                                    value={lotDate}
                                    onChangeText={handleDateChange}
                                    keyboardType="numeric"
                                    maxLength={6}
                                />
                                <TouchableOpacity onPress={() => setShowPicker(true)} accessibilityLabel="Open date picker" className="pl-2 py-2">
                                    <Ionicons name="calendar-outline" size={22} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Quantity */}
                    <Text className="text-gray-700 mb-1">Quantity</Text>
                    <TextInput
                        className="bg-blue-100 border rounded-lg px-4 py-4 text-base text-gray-800"
                        placeholder="Quantity"
                        placeholderTextColor="#9CA3AF"
                        value={qty}
                        onChangeText={setQty}
                        keyboardType="numeric"
                    />
                </View>

                <TouchableOpacity className="bg-purple-600 rounded-lg py-3 mt-6" onPress={handleGenerate}>
                    <Text className="text-white text-center font-semibold text-base">Generate QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-blue-600 rounded-lg py-3 mt-4" onPress={clearField}>
                    <Text className="text-white text-center font-semibold text-base">Clear field</Text>
                </TouchableOpacity>
            </View>

            {/* iOS shows inline modal; Android shows spinner dialog */}
            {showPicker && (
                <DateTimePicker
                    value={pickerDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={onChangePicker}
                />
            )}
        </View>
    );
};

export default GSmart;
