import { Tabs} from 'expo-router';
import { ScanLine, FileText, Sparkles, History } from 'lucide-react-native';
import '../globals.css';
import {Alert} from "react-native";
const fontSize = 12;



export default function Layout() {
    return (


        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#a5baf5',
                tabBarInactiveTintColor: '#61676e',

                tabBarStyle: {
                    height: 80, // ← adjust this value to your desired height
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                },
                tabBarLabelStyle: {
                    fontSize,
                    fontWeight: '600',
                    marginBottom: 4,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
            }}




        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Scan",
                    tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} />,
                    headerShown: true,
                    headerTitle: "QR Scan",
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#1E3A8A' },
                    headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
                }}


            />

            <Tabs.Screen
                name="gtext"
                options={{
                    title: "Text",
                    tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
                    headerShown: true,
                    headerTitle: "QR Generate Screen",
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#1E3A8A' },
                    headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
                }}
            />
            <Tabs.Screen
                name="gsmart"
                options={{
                    title: "Smart",
                    tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
                    headerShown: true,
                    headerTitle: "Smart Warehouse Generator",
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#1E3A8A' },
                    headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
                    headerShown: false,
                }}
            />
            {/* qr for smart */}
            <Tabs.Screen
                name="result/qr"
                options={{
                    title: 'QR Result',
                    headerShown: false,
                    href: null, // hides it from the tab bar

                }}
            />

            {/* qr for gtext */}
            <Tabs.Screen
                name="result/qrtext"
                options={{
                    title: 'QR Result',
                    headerShown: false,
                    href: null, // hides it from the tab bar

                }}
            />
        </Tabs>


    );

}