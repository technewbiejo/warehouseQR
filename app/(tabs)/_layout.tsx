import { Tabs } from 'expo-router';
import { ScanLine, FileText, Sparkles, History } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonHeader,commonHeader1, commonTabs, makeTabIcon } from '../theme';
import '../globals.css';

export default function Layout() {
    const insets = useSafeAreaInsets();
    
    return (
        <Tabs screenOptions={{
            ...commonTabs,
            tabBarStyle: {
                ...commonTabs.tabBarStyle,
                paddingBottom: Math.max(insets.bottom, 8),
                height: (commonTabs.tabBarStyle?.height as number || 72) + Math.max(insets.bottom - 8, 0),
            },
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Scan',
                    tabBarIcon: makeTabIcon(ScanLine),
                    ...commonHeader,
                }}
            />
            <Tabs.Screen
                name="gtext"
                options={{
                    title: 'Text',
                    tabBarIcon: makeTabIcon(FileText),
                    ...commonHeader,
                }}
            />
            <Tabs.Screen
                name="gsmart"
                options={{
                    title: 'Smart',
                    tabBarIcon: makeTabIcon(Sparkles),
                    ...commonHeader,
                }}
            />
            <Tabs.Screen
                name="icbin"
                options={{
                    title: 'IC',
                    tabBarIcon: makeTabIcon(Sparkles),
                    ...commonHeader1,

                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: makeTabIcon(History),
                    headerShown: false,
                }}
            />
            <Tabs.Screen name="result/qr" options={{ title: 'QR Result', headerShown: false, href: null }} />
            <Tabs.Screen name="result/qrtext" options={{ title: 'QR Result', headerShown: false, href: null }} />
            <Tabs.Screen name="result/qrbin" options={{ title: 'QR Result', headerShown: false, href: null }} />
        </Tabs>
    );
}
