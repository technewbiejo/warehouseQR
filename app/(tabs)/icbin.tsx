import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { cls, GlassCard, colors } from '../theme';

const formatDate = (d: Date) => d.toISOString().split('T')[0];

const ICSmart = () => {
    const router = useRouter();

    const textSanitize = (s: string) => s.replace(/[^0-9A-Za-z_-]/g, '');
    const numericOnly = (s: string) => s.replace(/\D+/g, '');
    const splitComposite = (value: string, delimiter: string): [string, string] => {
        if (!value) return ['', ''];
        const parts = value.split(delimiter);
        const left = parts[0]?.trim() ?? '';
        const right = parts[1]?.trim() ?? '';
        return [left, right];
    };

    const [deviceLeft, setDeviceLeft] = useState('');
    const [deviceRight, setDeviceRight] = useState('');
    const [erpCode, setErpCode] = useState('');
    const [marking, setMarking] = useState('');
    const [testProgramLeft, setTestProgramLeft] = useState('');
    const [testProgramRight, setTestProgramRight] = useState('');
    const [bin, setBin] = useState('');
    const [quantity, setQuantity] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [shipDate, setShipDate] = useState(formatDate(new Date()));
    const [showPicker, setShowPicker] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const {
        reset,
        device: rawDevice,
        erp: rawErp,
        marking: rawMarking,
        quantity: rawQuantity,
        testProgram: rawTestProgram,
        bin: rawBin,
        date: rawDate,
        serial: rawSerial,
    } = useLocalSearchParams();
    const pDevice = typeof rawDevice === 'string' ? rawDevice : '';
    const pErp = typeof rawErp === 'string' ? rawErp : '';
    const pMarking = typeof rawMarking === 'string' ? rawMarking : '';
    const pQuantity = typeof rawQuantity === 'string' ? rawQuantity : '';
    const pTestProgram = typeof rawTestProgram === 'string' ? rawTestProgram : '';
    const pBin = typeof rawBin === 'string' ? rawBin : '';
    const pDate = typeof rawDate === 'string' ? rawDate : '';
    const pSerial = typeof rawSerial === 'string' ? rawSerial : '';

    const clearField = async () => {
        setDeviceLeft('');
        setDeviceRight('');
        setErpCode('');
        setMarking('');
        setTestProgramLeft('');
        setTestProgramRight('');
        setBin('');
        setQuantity('');
        setSerialNumber('');
        setShipDate(formatDate(new Date()));
    };

    const handleGenerate = async () => {
        const trimmedDeviceLeft = deviceLeft.trim();
        const trimmedDeviceRight = deviceRight.trim();
        const trimmedErp = erpCode.trim();
        const trimmedMarking = marking.trim();
        const trimmedQuantity = quantity.trim();
        const trimmedTestProgramLeft = testProgramLeft.trim();
        const trimmedTestProgramRight = testProgramRight.trim();
        const trimmedBin = bin.trim();
        const trimmedDate = shipDate.trim();
        const trimmedSerial = serialNumber.trim();

        if (!trimmedDeviceLeft || !trimmedDeviceRight) {
            Alert.alert('Device', 'Please fill both halves of the Device field.');
            return;
        }

        if (!trimmedErp || !trimmedMarking || !trimmedQuantity || !trimmedBin || !trimmedDate) {
            Alert.alert('Missing Fields', 'Please fill out all required fields before generating the QR code.');
            return;
        }

        if (!trimmedTestProgramLeft || !trimmedTestProgramRight) {
            Alert.alert('Test Program', 'Please fill both halves of the Test Program field.');
            return;
        }

        if (!/^\d+$/.test(trimmedQuantity)) {
            Alert.alert('Quantity', 'Quantity must be numeric.');
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
            Alert.alert('Date', 'Please enter the date in YYYY-MM-DD format.');
            return;
        }

        const formattedDevice = `${trimmedDeviceLeft}-${trimmedDeviceRight}`;
        const formattedTestProgram = `${trimmedTestProgramLeft}_${trimmedTestProgramRight}`;

        // Format: DEVICE/ERP/MARKING/QUANTITY/TESTPROGRAM/BIN/DATE[/SERIAL]
        const segments = [
            formattedDevice,
            trimmedErp,
            trimmedMarking,
            trimmedQuantity,
            formattedTestProgram,
            trimmedBin,
            trimmedDate,
        ];
        if (trimmedSerial) {
            segments.push(trimmedSerial);
        }
        const qrData = segments.join('/');

        await new Promise((r) => setTimeout(r, 100));

        const newEntry = {
            label: 'IC BIN',
            data: qrData,
            timestamp: new Date().toLocaleString(),
            source: 'icbin' as const,
        };

        try {
            const existing = await AsyncStorage.getItem('qrHistory');
            const history = existing ? JSON.parse(existing) : [];

            // Check if an entry with the same Device/ERP combination exists
            const existingIndex = history.findIndex((entry: any) => {
                if (entry.source === 'icbin') {
                    const segments = entry.data.split('/');
                    const [existingDevice, existingErp] = segments;
                    return existingDevice === formattedDevice && existingErp === trimmedErp;
                }
                return false;
            });

            if (existingIndex !== -1) {
                // Update existing entry and move to top
                history.splice(existingIndex, 1); // Remove from current position
                history.unshift(newEntry); // Add to top with updated data
                console.log('Updated existing IC BIN entry:', `${formattedDevice}/${trimmedErp}`);
            } else {
                // Add new entry
                history.unshift(newEntry);
                console.log('Added new history entry');
            }

            await AsyncStorage.setItem('qrHistory', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }

        const params: Record<string, string> = {
            qrData,
            device: formattedDevice,
            erp: trimmedErp,
            marking: trimmedMarking,
            quantity: trimmedQuantity,
            testProgram: formattedTestProgram,
            bin: trimmedBin,
            date: trimmedDate,
        };
        if (trimmedSerial) {
            params.serial = trimmedSerial;
        }

        router.push({
            pathname: '/result/qrbin',
            params,
        });
    };

    useFocusEffect(
        useCallback(() => {
            if (reset === 'true') {
                clearField();
            } else if (pDevice || pErp || pMarking || pQuantity || pTestProgram || pBin || pDate || pSerial) {
                const [parsedDeviceLeft, parsedDeviceRight] = splitComposite(pDevice, '-');
                setDeviceLeft(parsedDeviceLeft);
                setDeviceRight(parsedDeviceRight);
                setErpCode(pErp);
                setMarking(pMarking);
                setQuantity(pQuantity);
                const [parsedProgramLeft, parsedProgramRight] = splitComposite(pTestProgram, '_');
                setTestProgramLeft(parsedProgramLeft);
                setTestProgramRight(parsedProgramRight);
                setBin(pBin);
                setShipDate(pDate || formatDate(new Date()));
                setSerialNumber(pSerial);
            }
        }, [reset, pDevice, pErp, pMarking, pQuantity, pTestProgram, pBin, pDate, pSerial])
    );

    const onChangePicker = (_: any, selected?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (selected) {
            setShipDate(formatDate(selected));
        }
    };

    const parsedDateForPicker = /^\d{4}-\d{2}-\d{2}$/.test(shipDate)
        ? new Date(`${shipDate}T00:00:00`)
        : new Date();

    // Container style for outlined inputs (uses theme colors)
    const inputStyle = (name: string) => ({
        borderWidth: focused === name ? 2 : 1.5,
        borderColor: focused === name ? colors.lime : '#3A3F48',
        borderRadius: 12,
        backgroundColor: 'transparent',
    });

    const baseInputProps = {
        className: 'p-4 text-white',
        placeholderTextColor: '#9CA3AF',
        underlineColorAndroid: 'transparent' as const, // hide the white underline on Android
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View className={cls.screen1}>

                <GlassCard>

                    <ScrollView

                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                        contentInsetAdjustmentBehavior="always"
                        automaticallyAdjustKeyboardInsets={true}
                        showsVerticalScrollIndicator={false}
                    >

                        <View className={cls.group1}>

                            {/* DEVICE */}
                            <Text className={cls.label}>DEVICE</Text>
                            <View className="flex-row items-center gap-2">
                                <View style={[inputStyle('deviceLeft'), { flex: 1 }]}>
                                    <TextInput
                                        {...baseInputProps}
                                        placeholder="e.g., BTD24D3"
                                        autoCapitalize="characters"
                                        value={deviceLeft}
                                        onFocus={() => setFocused('deviceLeft')}
                                        onBlur={() => setFocused(null)}
                                        onChangeText={(t) => setDeviceLeft(textSanitize(t).toUpperCase())}

                                    />
                                    {deviceLeft.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setDeviceLeft('')}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: [{ translateY: -10 }],
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text className="text-white font-semibold text-base">-</Text>
                                <View style={[inputStyle('deviceRight'), { flex: 1 }]}>
                                    <TextInput
                                        {...baseInputProps}
                                        placeholder="e.g., FV1206"
                                        autoCapitalize="characters"
                                        value={deviceRight}
                                        onFocus={() => setFocused('deviceRight')}
                                        onBlur={() => setFocused(null)}
                                        onChangeText={(t) => setDeviceRight(textSanitize(t).toUpperCase())}
                                    />
                                    {deviceRight.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setDeviceRight('')}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: [{ translateY: -10 }],
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* ERP CODE */}
                            <Text className={cls.label}>ERP Code</Text>
                            <View style={inputStyle('erp')}>
                                <TextInput
                                    {...baseInputProps}
                                    placeholder="e.g., C0B24D32A...."
                                    autoCapitalize="characters"
                                    value={erpCode}
                                    onFocus={() => setFocused('erp')}
                                    onBlur={() => setFocused(null)}
                                    onChangeText={(t) => setErpCode(textSanitize(t).toUpperCase())}
                                />
                                {erpCode.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setErpCode('')}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: [{ translateY: -10 }],
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Marking */}
                            <Text className={cls.label}>Marking</Text>
                            <View style={inputStyle('marking')}>
                                <TextInput
                                    {...baseInputProps}
                                    placeholder="e.g., C0B24D32AFG1...."
                                    autoCapitalize="characters"
                                    value={marking}
                                    onFocus={() => setFocused('marking')}
                                    onBlur={() => setFocused(null)}
                                    onChangeText={(t) => setMarking(textSanitize(t).toUpperCase())}
                                />
                                {marking.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setMarking('')}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: [{ translateY: -10 }],
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* TEST PROGRAM */}
                            <Text className={cls.label}>TEST PROGRAM</Text>
                            <View className="flex-row items-center gap-3">
                                <View style={[inputStyle('testProgramLeft'), { flex: 1 }]}>
                                    <TextInput
                                        {...baseInputProps}
                                        placeholder="e.g., BTD24D3"
                                        autoCapitalize="characters"
                                        value={testProgramLeft}
                                        onFocus={() => setFocused('testProgramLeft')}
                                        onBlur={() => setFocused(null)}
                                        onChangeText={(t) => setTestProgramLeft(textSanitize(t).toUpperCase())}
                                    />
                                    {testProgramLeft.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setTestProgramLeft('')}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: [{ translateY: -10 }],
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text className="text-white font-semibold text-base">_</Text>
                                <View style={[inputStyle('testProgramRight'), { flex: 1 }]}>
                                    <TextInput
                                        {...baseInputProps}
                                        placeholder="e.g., FV1206"
                                        autoCapitalize="characters"
                                        value={testProgramRight}
                                        onFocus={() => setFocused('testProgramRight')}
                                        onBlur={() => setFocused(null)}
                                        onChangeText={(t) => setTestProgramRight(textSanitize(t).toUpperCase())}
                                    />
                                    {testProgramRight.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setTestProgramRight('')}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: [{ translateY: -10 }],
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* BIN + DATE */}
                            <Text className={cls.label}>BIN & Date</Text>
                            <View className="flex-row items-center gap-3">
                                {/* BIN */}
                                <View style={[inputStyle('bin'), { flex: 1 }]}>
                                    <TextInput
                                        {...baseInputProps}
                                        placeholder="e.g., 485"
                                        value={bin}
                                        keyboardType="numeric"
                                        maxLength={3}
                                        onFocus={() => setFocused('bin')}
                                        onBlur={() => setFocused(null)}
                                        onChangeText={(t) => setBin(numericOnly(t))}
                                    />
                                    {bin.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setBin('')}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: [{ translateY: -10 }],
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* DATE */}
                                <View style={[inputStyle('lotDate'), { flex: 2 }]}>
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
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#9CA3AF"
                                            underlineColorAndroid="transparent"
                                            value={shipDate}
                                            keyboardType="numbers-and-punctuation"
                                            onFocus={() => setFocused('lotDate')}
                                            onBlur={() => setFocused(null)}
                                            onChangeText={(text) => setShipDate(text.replace(/[^0-9-]/g, ''))}
                                        />
                                    </View>
                                    {shipDate.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setShipDate('')}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: [{ translateY: -10 }],
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Quantity */}
                            <Text className={cls.label}>Quantity</Text>
                            <View style={inputStyle('qty')}>
                                <TextInput
                                    {...baseInputProps}
                                    placeholder="e.g., 3000"
                                    value={quantity}
                                    keyboardType="numeric"
                                    onFocus={() => setFocused('qty')}
                                    onBlur={() => setFocused(null)}
                                    onChangeText={(t) => setQuantity(numericOnly(t))}
                                />
                                {quantity.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setQuantity('')}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: [{ translateY: -10 }],
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Serial NO */}
                            <Text className={cls.label}>Serial No (optional)</Text>
                            <View style={inputStyle('serial')}>
                                <TextInput
                                    {...baseInputProps}
                                    placeholder="e.g., FML2509060041"
                                    autoCapitalize="characters"
                                    value={serialNumber}
                                    onFocus={() => setFocused('serial')}
                                    onBlur={() => setFocused(null)}
                                    onChangeText={(t) => setSerialNumber(textSanitize(t).toUpperCase())}
                                />
                                {serialNumber.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setSerialNumber('')}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: [{ translateY: -10 }],
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={15} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            className={`${cls.btn.primary} ${cls.mt6}`}
                            onPress={handleGenerate}
                        >
                            <Text className={cls.btnTextOnPrimary}>Generate QR Code</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`${cls.btn.secondary} ${cls.mt4}`}
                            onPress={clearField}
                        >
                            <Text className={cls.btnTextOnDark}>Clear field</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </GlassCard>

                {showPicker && (
                    <DateTimePicker
                        value={parsedDateForPicker}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={onChangePicker}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default ICSmart;
