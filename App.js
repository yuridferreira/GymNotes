import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const STORAGE_KEY = "treinos_v2";
const THEME_KEY = "tema_v2";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [treinos, setTreinos] = useState({
    Peito: [],
    Costas: [],
    Pernas: [],
    Ombros: [],
    Bíceps: [],
    Tríceps: [],
    Abdômen: [],
  });

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [series, setSeries] = useState("");
  const [repeticoes, setRepeticoes] = useState("");
  const [peso, setPeso] = useState("");
  const [grupo, setGrupo] = useState("Peito");

  // Carregar dados e tema
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTreinos(JSON.parse(raw));
        const tema = await AsyncStorage.getItem(THEME_KEY);
        if (tema) setDarkMode(tema === "dark");
      } catch (e) {
        console.warn("Erro carregando dados:", e);
      }
    })();
  }, []);

  // Salvar treinos
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(treinos));
  }, [treinos]);

  // Salvar tema
  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  const adicionarTreino = () => {
    if (!nome.trim() || !series.trim() || !repeticoes.trim()) return;

    const novo = {
      id: Date.now().toString(),
      nome: nome.trim(),
      series: Number(series) || 0,
      repeticoes: Number(repeticoes) || 0,
      peso: Number(peso) || 0,
      data: new Date().toLocaleDateString(),
    };

    setTreinos((prev) => ({
      ...prev,
      [grupo]: [...(prev[grupo] || []), novo],
    }));

    setNome("");
    setSeries("");
    setRepeticoes("");
    setPeso("");
    setGrupo("Peito");
  };

  const excluirTreino = (sectionTitle, id) => {
    setTreinos((prev) => ({
      ...prev,
      [sectionTitle]: (prev[sectionTitle] || []).filter((t) => t.id !== id),
    }));
  };

  // Estatísticas
  const allItems = Object.values(treinos).flat();
  const totalExercicios = allItems.length;
  const totalSeries = allItems.reduce((acc, t) => acc + Number(t.series || 0), 0);
  const totalRepeticoes = allItems.reduce(
    (acc, t) => acc + (Number(t.series || 0) * Number(t.repeticoes || 0)),
    0
  );
  const totalPeso = allItems.reduce(
    (acc, t) => acc + (Number(t.peso || 0) * Number(t.series || 0) * Number(t.repeticoes || 0)),
    0
  );

  const theme = darkMode ? estilos.dark : estilos.light;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={theme.container} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={theme.header}>
              <Text style={theme.titulo}>🏋️‍♂️ Meus Treinos</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: darkMode ? "#F9FAFB" : "#111827", marginRight: 8 }}>
                  {darkMode ? "Escuro" : "Claro"}
                </Text>
                <TouchableOpacity
                  style={theme.switchButton}
                  onPress={() => setDarkMode((s) => !s)}
                  activeOpacity={0.8}
                >
                  <Text style={theme.switchText}>{darkMode ? "☀️" : "🌙"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Formulário */}
            <TextInput
              style={theme.input}
              placeholder="Exercício (ex: Supino)"
              placeholderTextColor={darkMode ? "#9CA3AF" : "#6B7280"}
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={theme.input}
              placeholder="Séries"
              placeholderTextColor={darkMode ? "#9CA3AF" : "#6B7280"}
              keyboardType="numeric"
              value={series}
              onChangeText={setSeries}
            />
            <TextInput
              style={theme.input}
              placeholder="Repetições"
              placeholderTextColor={darkMode ? "#9CA3AF" : "#6B7280"}
              keyboardType="numeric"
              value={repeticoes}
              onChangeText={setRepeticoes}
            />
            <TextInput
              style={theme.input}
              placeholder="Peso (kg)"
              placeholderTextColor={darkMode ? "#9CA3AF" : "#6B7280"}
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
            />

            <View style={theme.pickerBox}>
              <Picker
                selectedValue={grupo}
                onValueChange={(v) => setGrupo(v)}
                dropdownIconColor={darkMode ? "#fff" : "#000"}
                style={{ color: darkMode ? "#fff" : "#000" }}
              >
                {Object.keys(treinos).map((g) => (
                  <Picker.Item label={g} value={g} key={g} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={theme.botao} onPress={adicionarTreino}>
              <Text style={theme.botaoTexto}>➕ Adicionar</Text>
            </TouchableOpacity>

            {/* Estatísticas */}
            <View style={theme.estatisticasBox}>
              <Text style={theme.estatisticasTexto}>Exercícios: {totalExercicios}</Text>
              <Text style={theme.estatisticasTexto}>Total de séries: {totalSeries}</Text>
              <Text style={theme.estatisticasTexto}>Total de repetições: {totalRepeticoes}</Text>
              <Text style={theme.estatisticasTexto}>Peso total levantado: {totalPeso} kg</Text>
            </View>

            {/* Lista de treinos com altura limitada */}
            <View style={theme.listaContainer}>
              <Text style={theme.subtitulo}>📋 Lista de Treinos</Text>
              <ScrollView
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {Object.keys(treinos).map((sectionTitle) => (
                  <View key={sectionTitle} style={{ marginBottom: 12 }}>
                    <Text style={theme.grupoTitulo}>{sectionTitle}</Text>
                    {treinos[sectionTitle].map((item) => (
                      <View key={item.id} style={theme.item}>
                        <Text style={theme.itemTexto}>
                          {item.data} – {item.nome} → {item.series}x{item.repeticoes} ({item.peso}kg)
                        </Text>
                        <TouchableOpacity
                          style={theme.botaoExcluirCompacto}
                          onPress={() => excluirTreino(sectionTitle, item.id)}
                        >
                          <Text style={theme.excluirTexto}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// 🎨 Estilos
const estilos = {
  light: StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingTop: 12 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    titulo: { fontSize: 26, fontWeight: "bold", color: "#111827" },
    input: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 10, color: "#111827" },
    pickerBox: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", borderRadius: 10, marginBottom: 10 },
    botao: { backgroundColor: "#3B82F6", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 12 },
    botaoTexto: { color: "#fff", fontWeight: "bold" },
    estatisticasBox: { marginBottom: 12, padding: 10, backgroundColor: "#E5E7EB", borderRadius: 10 },
    estatisticasTexto: { color: "#111827", fontWeight: "600", marginBottom: 4 },
    grupoTitulo: { fontSize: 20, fontWeight: "600", color: "#1F2937", marginBottom: 6 },
    item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB" },
    itemTexto: { color: "#374151" },
    botaoExcluirCompacto: { backgroundColor: "#EF4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    excluirTexto: { color: "#fff", fontWeight: "700" },
    switchButton: { padding: 8 },
    switchText: { fontSize: 18 },
    listaContainer: {
      maxHeight: 350,
      borderWidth: 1,
      borderColor: "#4B5563",
      borderRadius: 10,
      padding: 8,
      marginBottom: 20,
    },
    subtitulo: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
      textAlign: "center",
      color: "#111827",
    },
  }),

  dark: StyleSheet.create({
    container: { flex: 1, backgroundColor: "#111827", paddingHorizontal: 16, paddingTop: 12 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    titulo: { fontSize: 26, fontWeight: "bold", color: "#F9FAFB" },
    input: { borderWidth: 1, borderColor: "#374151", backgroundColor: "#1F2937", padding: 12, marginBottom: 10, borderRadius: 10, color: "#F9FAFB" },
    pickerBox: { borderWidth: 1, borderColor: "#374151", backgroundColor: "#1F2937", borderRadius: 10, marginBottom: 10 },
    botao: { backgroundColor: "#3B82F6", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 12 },
    botaoTexto: { color: "#fff", fontWeight: "bold" },
    estatisticasBox: { marginBottom: 12, padding: 10, backgroundColor: "#374151", borderRadius: 10 },
    estatisticasTexto: { color: "#F9FAFB", fontWeight: "600", marginBottom: 4 },
    grupoTitulo: { fontSize: 20, fontWeight: "600", color: "#E5E7EB", marginBottom: 6 },
    item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#1F2937", borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#374151" },
    itemTexto: { color: "#D1D5DB" },
    botaoExcluirCompacto: { backgroundColor: "#DC2626", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    excluirTexto: { color: "#fff", fontWeight: "700" },
    switchButton: { padding: 8 },
    switchText: { fontSize: 18 },
    listaContainer: {
      maxHeight: 350,
      borderWidth: 1,
      borderColor: "#4B5563",
      borderRadius: 10,
      padding: 8,
      marginBottom: 20,
    },
    subtitulo: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
      textAlign: "center",
      color: "#F9FAFB",
    },
  }),
};
