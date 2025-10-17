import { Tabs } from 'expo-router';
import { ScanLine, FileText, Sparkles, History } from 'lucide-react-native';
import { commonHeader, commonTabs, makeTabIcon } from '../theme';
import '../globals.css';

export default function Layout() {
    return (

        <Tabs screenOptions={commonTabs}>
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
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: makeTabIcon(History),
                    headerShown: false,
                }}
            />
            <Tabs.Screen name="result/qr" options={{ title: 'QR Result', headerShown: false, href: null }} />
            <Tabs.Screen name="result/qrtext" options={{ title: 'QR Result', headerShown: false, href: null }} />
        </Tabs>
    );
}
