import React from 'react';
import { View, ViewProps, TextProps } from 'react-native';
import { BlurView } from 'expo-blur';
import {LinearGradient} from "react-native-svg";

// ======= PALETTE (dark + neon) =======
export const colors = {
    // surfaces
    bgRoot: '#0C0D11',          // app background (very dark)
    bgCardGlass: 'rgba(255,255,255,0.06)',   // translucent overlay for glass
    borderGlass: 'rgba(255,255,255,0.12)',
    // text
    textPrimary: 'text-[#FAFAFA]',
    textSecondary: 'text-[#9CA3AF]',
    textMuted: 'text-[#6B7280]',
    // brand
    brand: '#131321',
    lime: '#D5FF40',            // primary button
    // inputs
    inputBg: '#0F1115',
    inputBorder: '#2A2F37',
    // tabs
    tabActive: '#D5FF40',
    tabInactive: '#515760',
    tabBg: '#0C0D11',
};

// ======= COMMON NAV (optional; keep if you use it) =======
export const commonHeader = {
    headerShown: true,
    headerTitle: 'Warehouse Scanner',
    headerTitleAlign: 'center' as const,
    headerStyle: { backgroundColor: colors.brand },
    headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' as const },
};

// --- Global Tabs options (used by expo-router <Tabs screenOptions>) ---
export const commonTabs = {
    headerShown: false,
    tabBarActiveTintColor: colors.tabActive,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarStyle: {
        height: 72,
        backgroundColor: colors.tabBg,
        borderTopWidth: 0,
    },
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600' as const,
        marginBottom: 4,
    },
    tabBarIconStyle: { marginTop: 6 },
} as const;

// ======= UTILITY CLASSNAMES (NativeWind) =======
export const cls = {
    // layout
    screen: `flex-1 bg-[#0C0D11] justify-center items-center px-4`,
    group: `space-y-4`,
    mt6: `mt-6`,
    mt4: `mt-4`,

    // glass card typography
    heading: `text-2xl font-extrabold ${colors.textPrimary} text-center mb-2`,
    subheading: `text-base ${colors.textSecondary} text-center mb-6`,
    label: `text-sm ${colors.textSecondary} mb-2`,

    // inputs
    input: `rounded-lg px-4 py-4 text-base text-white`,
    inputContainer: `rounded-lg`,
    // buttons
    btn: {
        primary: `bg-[#D5FF40] rounded-lg py-3`,
        secondary: `bg-[#272A33] rounded-lg py-3`,
    },
    btnTextOnPrimary: `text-black text-center font-semibold text-base`,
    btnTextOnDark: `text-white text-center font-semibold text-base`,

    // History page
    historyTitle: `text-3xl font-extrabold text-[#FAFAFA] mb-2 text-left`,
    historySubtitle: `text-base text-[#9CA3AF] mb-4 text-left`,

    historyListWrapper: `mt-2`,
    historyEmptyWrap: `flex-1 items-center justify-center px-6 py-10`,
    historyEmptyTitle: `text-lg font-semibold text-gray-400 mb-1`,
    historyEmptySubtitle: `text-sm text-gray-500 text-center`,

    // History item (glass row)
    historyItem: `rounded-xl px-4 py-5 mb-4 border border-[${colors.borderGlass}]`,
    historyRowTop: `flex-row justify-between items-center mb-2`,
    historyData: `text-sm text-[#D1D5DB]`, // light gray on dark

    // chips / meta
    historyChip: `px-3 py-1 rounded-full bg-[#D5FF40]`,
    historyChipText: `text-black text-xs font-semibold`,
    historyTime: `text-[11px] text-[#9CA3AF]`,

    // actions
    historyActions: `flex-row justify-end space-x-6 mt-3`,
    actionCopyText: `text-[#3B82F6] text-xs font-medium px-1`,
    actionEditText: `text-[#9CA3AF] text-xs font-medium`,

    // Clear bar button (full width)
    dangerBar: `bg-[#B91C1C] py-4 rounded-xl`,
    dangerBarText: `text-white text-center font-semibold`,
};

export const makeTabIcon =
    (Icon: React.ComponentType<{ color?: string; size?: number }>) =>
        ({ focused, size = 22, color }: { focused: boolean; size?: number; color: string }) => (
            <View style={{ alignItems: 'center' }}>
                {/* tiny “pill” indicator above icon */}
                <View
                    style={{
                        height: 4,
                        width: 28,
                        borderRadius: 999,
                        marginBottom: 6,
                        backgroundColor: focused ? colors.tabActive : 'transparent',
                    }}
                />
                <Icon color={focused ? colors.tabActive : colors.tabInactive} size={size} />
            </View>
        );
// ======= GLASS CARD (component wrapper) =======
// Use this instead of a plain View for the card shell
export const GlassCard = ({
                              children,
                              className,
                              style,
                          }: ViewProps & { className?: string }) => {


    return (
        <View
            className={`w-full max-w-md rounded-2xl overflow-hidden`}
            style={[
                {
                    backgroundColor: colors.bgCardGlass,
                    borderColor: colors.borderGlass,
                    borderWidth: 1,
                    shadowColor: '#000',
                    shadowOpacity: 0.35,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 10 },
                },
                style,
            ]}
        >
            <BlurView intensity={20} tint="dark" style={{ padding: 16 }}>
                {children}
            </BlurView>
        </View>


    );
};


// ======= INPUT SHELL (for consistent dark inputs) =======
export const InputShell = ({
                               children,
                               className,
                               style,
                           }: ViewProps & { className?: string }) => {
    return (
        <View
            className={className}
            style={[
                {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

// ======= Title helpers (optional) =======
export const Title = (p: TextProps) => <View><></></View>; // placeholder if you want typed text components later
