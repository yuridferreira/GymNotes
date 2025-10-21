// ConfigScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "tema_v2";
const NOTIFICATIONS_KEY = "notifications_v2";
const AUTO_BACKUP_KEY = "autoBackup_v2";

export default function ConfigScreen({ darkMode, setDarkMode }) {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  // Carregar configurações ao iniciar
  useEffect(() => {
    (async () => {
      try {
        const tema = await AsyncStorage.getItem(THEME_KEY);
        if (tema) setDarkMode(tema === "dark");

        const noti = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        if (noti !== null) setNotifications(noti === "true");

        const backup = await AsyncStorage.getItem(AUTO_BACKUP_KEY);
        if (backup !== null) setAutoBackup(backup === "true");
      } catch (e) {
        console.warn("Erro ao carregar configurações:", e);
      }
    })();
  }, []);

  // Salvar darkMode
  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  // Salvar notifications
  useEffect(() => {
    AsyncStorage.setItem(NOTIFICATIONS_KEY, notifications.toString());
  }, [notifications]);

  // Salvar autoBackup
  useEffect(() => {
    AsyncStorage.setItem(AUTO_BACKUP_KEY, autoBackup.toString());
  }, [autoBackup]);

  return (
    <ScrollView
      contentContainerStyle={darkMode ? styles.dark.container : styles.light.container}
    >
      <Text style={darkMode ? styles.dark.title : styles.light.title}>⚙️ Configurações</Text>

      {/* Dark Mode */}
      <View style={styles.optionRow}>
        <Text style={darkMode ? styles.dark.optionText : styles.light.optionText}>Modo Escuro</Text>
        <Switch
          value={darkMode}
          onValueChange={(v) => setDarkMode(v)}
          trackColor={{ false: "#767577", true: "#3B82F6" }}
          thumbColor={darkMode ? "#f9fafb" : "#111827"}
        />
      </View>

      {/* Notificações */}
      <View style={styles.optionRow}>
        <Text style={darkMode ? styles.dark.optionText : styles.light.optionText}>Notificações</Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: "#767577", true: "#3B82F6" }}
          thumbColor={darkMode ? "#f9fafb" : "#111827"}
        />
      </View>

      {/* Backup Automático */}
      <View style={styles.optionRow}>
        <Text style={darkMode ? styles.dark.optionText : styles.light.optionText}>Backup Automático</Text>
        <Switch
          value={autoBackup}
          onValueChange={setAutoBackup}
          trackColor={{ false: "#767577", true: "#3B82F6" }}
          thumbColor={darkMode ? "#f9fafb" : "#111827"}
        />
      </View>
    </ScrollView>
  );
}

const styles = {
  light: StyleSheet.create({
    container: { flexGrow: 1, padding: 16, backgroundColor: "#F9FAFB" },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#111827" },
    optionText: { fontSize: 18, color: "#111827" },
  }),
  dark: StyleSheet.create({
    container: { flexGrow: 1, padding: 16, backgroundColor: "#111827" },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#F9FAFB" },
    optionText: { fontSize: 18, color: "#F9FAFB" },
  }),
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#6B7280",
  },
};
