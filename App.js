import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTreinos,
  addTreino,
  updateTreino,
  deleteTreino,
} from "./database"; // Ajuste o caminho conforme seu projeto

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [treinos, setTreinos] = useState([]);
  const [nome, setNome] = useState("");
  const [series, setSeries] = useState("");
  const [repeticoes, setRepeticoes] = useState("");
  const [peso, setPeso] = useState("");
  const [grupo, setGrupo] = useState("Peito");
  const [editId, setEditId] = useState(null);
  const [filtro, setFiltro] = useState("Todos");

  const theme = darkMode ? estilos.dark : estilos.light;

  useEffect(() => {
    const init = async () => {
      // Carregar tema salvo
      const tema = await AsyncStorage.getItem("tema");
      if (tema) setDarkMode(tema === "dark");

      // Carregar treinos
      await carregarTreinos();
    };
    init();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("tema", darkMode ? "dark" : "light");
  }, [darkMode]);

  const carregarTreinos = async () => {
    try {
      const dados = await getTreinos();
      setTreinos(dados);
    } catch (err) {
      console.log("Erro ao carregar treinos:", err);
    }
  };

  const limparCampos = () => {
    setNome("");
    setSeries("");
    setRepeticoes("");
    setPeso("");
    setGrupo("Peito");
    setEditId(null);
  };

  const salvarTreino = async () => {
    if (!nome.trim() || !series.trim() || !repeticoes.trim()) return;

    const s = Number(series);
    const r = Number(repeticoes);
    const p = Number(peso) || 0;
    if (isNaN(s) || isNaN(r) || isNaN(p)) return;

    const novoTreino = {
      nome: nome.trim(),
      series: s,
      repeticoes: r,
      peso: p,
      grupo,
      data: Date.now(), // timestamp
    };

    try {
      if (editId !== null) {
        await updateTreino({ id: editId, ...novoTreino });
      } else {
        await addTreino(novoTreino);
      }
      await carregarTreinos();
      limparCampos();
    } catch (err) {
      console.log("Erro ao salvar treino:", err);
    }
  };

  const excluirTreino = async (id) => {
    try {
      await deleteTreino(id);
      await carregarTreinos();
    } catch (err) {
      console.log("Erro ao excluir treino:", err);
    }
  };

  const editarTreino = (t) => {
    setNome(t.nome);
    setSeries(t.series.toString());
    setRepeticoes(t.repeticoes.toString());
    setPeso(t.peso.toString());
    setGrupo(t.grupo);
    setEditId(t.id);
  };

  const filtrarTreinos = () => {
    const hoje = new Date();
    return treinos.filter((t) => {
      const dataTreino = new Date(t.data);
      if (filtro === "Hoje") return dataTreino.toDateString() === hoje.toDateString();
      if (filtro === "Semana") return (hoje - dataTreino) / (1000 * 60 * 60 * 24) <= 7;
      if (filtro === "Mês")
        return hoje.getMonth() === dataTreino.getMonth() && hoje.getFullYear() === dataTreino.getFullYear();
      return true;
    });
  };

  const sections = Object.values(
    filtrarTreinos().reduce((acc, t) => {
      if (!acc[t.grupo]) acc[t.grupo] = { title: t.grupo, data: [] };
      acc[t.grupo].data.push(t);
      return acc;
    }, {})
  );

  const totalExercicios = treinos.length;
  const totalSeries = treinos.reduce((acc, t) => acc + Number(t.series), 0);
  const totalRepeticoes = treinos.reduce((acc, t) => acc + Number(t.series) * Number(t.repeticoes), 0);
  const totalPeso = treinos.reduce((acc, t) => acc + Number(t.peso || 0) * Number(t.series) * Number(t.repeticoes), 0);

  const renderTreino = ({ item }) => (
    <View style={theme.item}>
      <Text style={theme.itemTexto}>
        {new Date(item.data).toLocaleDateString()} – {item.nome} → {item.series}x{item.repeticoes} ({item.peso}kg)
      </Text>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={[theme.botaoEditar, { marginRight: 8 }]} onPress={() => editarTreino(item)}>
          <Text style={theme.botaoEditarTexto}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={theme.botaoExcluirCompacto} onPress={() => excluirTreino(item.id)}>
          <Text style={theme.excluirTexto}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
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
        <Picker selectedValue={grupo} onValueChange={setGrupo} dropdownIconColor={darkMode ? "#fff" : "#000"} style={{ color: darkMode ? "#fff" : "#000" }}>
          <Picker.Item label="Peito" value="Peito" />
          <Picker.Item label="Costas" value="Costas" />
          <Picker.Item label="Pernas" value="Pernas" />
          <Picker.Item label="Ombros" value="Ombros" />
          <Picker.Item label="Braços" value="Braços" />
          <Picker.Item label="Abdômen" value="Abdômen" />
        </Picker>
      </View>

      <TouchableOpacity style={theme.botao} onPress={salvarTreino}>
        <Text style={theme.botaoTexto}>{editId !== null ? "💾 Atualizar" : "➕ Adicionar"}</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 12 }}>
        {["Todos", "Hoje", "Semana", "Mês"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFiltro(f)}>
            <Text style={{ color: filtro === f ? "#3B82F6" : darkMode ? "#F9FAFB" : "#111827", fontWeight: "600" }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={theme.estatisticasBox}>
        <Text style={theme.estatisticasTexto}>Exercícios: {totalExercicios}</Text>
        <Text style={theme.estatisticasTexto}>Total de séries: {totalSeries}</Text>
        <Text style={theme.estatisticasTexto}>Total de repetições: {totalRepeticoes}</Text>
        <Text style={theme.estatisticasTexto}>Peso total levantado: {totalPeso} kg</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={theme.container} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={theme.titulo}>🏋️‍♂️ Meus Treinos</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: darkMode ? "#F9FAFB" : "#111827", marginRight: 8 }}>{darkMode ? "Escuro" : "Claro"}</Text>
              <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} trackColor={{ false: "#767577", true: "#3B82F6" }} thumbColor={darkMode ? "#f9fafb" : "#111827"} />
            </View>
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTreino}
            renderSectionHeader={({ section: { title } }) => (
              <View style={theme.grupoBox}>
                <Text style={theme.grupoTitulo}>{title}</Text>
              </View>
            )}
            ListHeaderComponent={<ListHeader />}
            ListEmptyComponent={() => <Text style={{ color: darkMode ? "#F9FAFB" : "#111827", textAlign: "center", marginTop: 20 }}>Nenhum treino cadastrado.</Text>}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// --- estilos ---
const estilos = {
  light: StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
    titulo: { fontSize: 26, fontWeight: "bold", marginBottom: 12, color: "#111827" },
    input: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 10, color: "#111827" },
    pickerBox: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", borderRadius: 10, marginBottom: 10 },
    botao: { backgroundColor: "#3B82F6", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 12 },
    botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    grupoBox: { marginBottom: 12 },
    grupoTitulo: { fontSize: 20, fontWeight: "600", color: "#1F2937" },
    item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB" },
    itemTexto: { color: "#374151", flexShrink: 1 },
    botaoExcluirCompacto: { backgroundColor: "#EF4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    botaoEditar: { backgroundColor: "#FACC15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    botaoEditarTexto: { color: "#111827", fontWeight: "700" },
    excluirTexto: { color: "#fff", fontWeight: "700" },
    estatisticasBox: { padding: 10, backgroundColor: "#E5E7EB", borderRadius: 10, marginBottom: 12 },
    estatisticasTexto: { color: "#111827", fontWeight: "600", marginBottom: 4 },
  }),
  dark: StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#111827" },
    titulo: { fontSize: 26, fontWeight: "bold", marginBottom: 12, color: "#F9FAFB" },
    input: { borderWidth: 1, borderColor: "#374151", backgroundColor: "#1F2937", padding: 12, marginBottom: 10, borderRadius: 10, color: "#F9FAFB" },
    pickerBox: { borderWidth: 1, borderColor: "#374151", backgroundColor: "#1F2937", borderRadius: 10, marginBottom: 10 },
    botao: { backgroundColor: "#3B82F6", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 12 },
    botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    grupoBox: { marginBottom: 12 },
    grupoTitulo: { fontSize: 20, fontWeight: "600", color: "#E5E7EB" },
    item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#1F2937", borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#374151" },
    itemTexto: { color: "#D1D5DB", flexShrink: 1 },
    botaoExcluirCompacto: { backgroundColor: "#DC2626", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    botaoEditar: { backgroundColor: "#FBBF24", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    botaoEditarTexto: { color: "#111827", fontWeight: "700" },
    excluirTexto: { color: "#fff", fontWeight: "700" },
    estatisticasBox: { padding: 10, backgroundColor: "#374151", borderRadius: 10, marginBottom: 12 },
    estatisticasTexto: { color: "#F9FAFB", fontWeight: "600", marginBottom: 4 },
  }),
};
