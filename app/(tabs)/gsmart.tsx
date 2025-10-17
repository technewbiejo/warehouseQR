import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { cls, GlassCard } from '../theme';

const pad2 = (n: number) => n.toString().padStart(2, '0');
const toYYMMDD = (d: Date) =>
    `${pad2(d.getFullYear() % 100)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;

const GSmart = () => {
    const router = useRouter();

    const [id1, setId1] = useState('');
    const [part, setPart] = useState('');
    const [lotPrefix, setLotPrefix] = useState('');
    const [lotDate, setLotDate] = useState('');
    const [qty, setQty] = useState('');

    const [showPicker, setShowPicker] = useState(false);
    const [pickerDate, setPickerDate] = useState<Date>(new Date());

    // focused field tracking
    const [focused, setFocused] = useState<string | null>(null);

    const { reset, id1: rawId1, part: rawPart, lot: rawLot, qty: rawQty } =
        useLocalSearchParams();
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
    const handlePrefixChange = (s: string) => setLotPrefix(digitsOnly(s).slice(0, 4));
    const handleDateChange = (s: string) => setLotDate(digitsOnly(s).slice(0, 6));

    const getCombinedLot = () => (lotPrefix && lotDate ? `${lotPrefix}-${lotDate}` : '');

    const handleGenerate = async () => {
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

        await new Promise((r) => setTimeout(r, 100));

        const newEntry = {
            label: 'Smart QR',
            data: qrData,
            timestamp: new Date().toLocaleString(),
            source: 'gsmart' as const,
        };

        try {
            const existing = await AsyncStorage.getItem('qrHistory');
            const history = existing ? JSON.parse(existing) : [];
            history.unshift(newEntry);
            await AsyncStorage.setItem('qrHistory', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }

        router.push({
            pathname: '/result/qr',
            params: { qrData, id1, part, lot: lotCombined, qty },
        });
    };

    useFocusEffect(
        useCallback(() => {
            if (reset === 'true') {
                clearField();
            } else if (pId1 || pPart || pLot || pQty) {
                setId1(pId1);
                setPart(pPart);
                setQty(pQty);
                const m =
                    typeof pLot === 'string' ? pLot.match(/^(\d{4})-(\d{6})$/) : null;
                if (m) {
                    setLotPrefix(m[1]);
                    setLotDate(m[2]);
                } else {
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

    const onChangePicker = (_: any, selected?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (selected) {
            setPickerDate(selected);
            setLotDate(toYYMMDD(selected));
        }
    };

    // Dynamic border color when input focused
    const inputStyle = (name: string) => ({
        borderWidth: 1.5,
        borderColor: focused === name ? '#D5FF40' : 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        backgroundColor: '#0F1115',
    });

    return (
        <View className={cls.screen}>
            <GlassCard>
                <Text className={cls.heading}>Smart Scan QR Code</Text>
                <Text className={cls.subheading}>
                    Enter the details below to create a structured QR code.
                </Text>

                <View className={cls.group}>
                    {/* Code Part */}
                    <Text className={cls.label}>Code Part</Text>
                    <View style={inputStyle('id1')}>
                        <TextInput
                            className="p-4 text-white"
                            placeholder="e.g., CN2001233342"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="characters"
                            value={id1}
                            onFocus={() => setFocused('id1')}
                            onBlur={() => setFocused(null)}
                            onChangeText={(t) => setId1(t.toUpperCase())}
                        />
                    </View>

                    {/* ID Part Number */}
                    <Text className={cls.label}>ID Part Number</Text>
                    <View style={inputStyle('part')}>
                        <TextInput
                            className="p-4 text-white"
                            placeholder="e.g., C10233124354"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="characters"
                            value={part}
                            onFocus={() => setFocused('part')}
                            onBlur={() => setFocused(null)}
                            onChangeText={(t) => setPart(t.toUpperCase())}
                        />
                    </View>

                    {/* Lot Code */}
                    <Text className={cls.label}>Lot Code</Text>
                    <View className="flex-row items-center gap-3">
                        {/* Prefix */}
                        <View style={[{ flex: 1 }, inputStyle('lotPrefix')]}>
                            <TextInput
                                className="p-4 text-white text-center"
                                placeholder="1811"
                                placeholderTextColor="#9CA3AF"
                                value={lotPrefix}
                                onFocus={() => setFocused('lotPrefix')}
                                onBlur={() => setFocused(null)}
                                onChangeText={handlePrefixChange}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>

                        <Text className="text-gray-500">-</Text>

                        {/* Date (YYMMDD) with icon */}
                        <View style={[{ flex: 2 }, inputStyle('lotDate')]}>
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => setShowPicker(true)}
                                    accessibilityLabel="Open date picker"
                                    className="px-3 py-3"
                                >
                                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                                <TextInput
                                    className="flex-1 pr-3 py-3 text-base text-white"
                                    placeholder="YYMMDD"
                                    placeholderTextColor="#9CA3AF"
                                    value={lotDate}
                                    onFocus={() => setFocused('lotDate')}
                                    onBlur={() => setFocused(null)}
                                    onChangeText={handleDateChange}
                                    keyboardType="numeric"
                                    maxLength={6}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Quantity */}
                    <Text className={cls.label}>Quantity</Text>
                    <View style={inputStyle('qty')}>
                        <TextInput
                            className="p-4 text-white"
                            placeholder="e.g., 3000"
                            placeholderTextColor="#9CA3AF"
                            value={qty}
                            onFocus={() => setFocused('qty')}
                            onBlur={() => setFocused(null)}
                            onChangeText={setQty}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className={`${cls.btn.primary} ${cls.mt6}`}
                    onPress={handleGenerate}
                >
                    <Text className={cls.btnTextOnPrimary}>Generate QR Code</Text>
                </TouchableOpacity>
            </GlassCard>

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
