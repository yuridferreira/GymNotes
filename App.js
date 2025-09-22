import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

export default function App() {
  const systemScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemScheme === "dark");
  const [treinos, setTreinos] = useState([]);
  const [nome, setNome] = useState("");
  const [series, setSeries] = useState("");
  const [repeticoes, setRepeticoes] = useState("");
  const [peso, setPeso] = useState("");
  const [grupo, setGrupo] = useState("Peito");

  // Carregar treinos e tema salvo
  useEffect(() => {
    const carregar = async () => {
      const data = await AsyncStorage.getItem("treinos");
      if (data) setTreinos(JSON.parse(data));
      const tema = await AsyncStorage.getItem("tema");
      if (tema) setDarkMode(tema === "dark");
    };
    carregar();
  }, []);

  // Salvar treinos e tema
  useEffect(() => {
    AsyncStorage.setItem("treinos", JSON.stringify(treinos));
  }, [treinos]);

  useEffect(() => {
    AsyncStorage.setItem("tema", darkMode ? "dark" : "light");
  }, [darkMode]);

  const adicionarTreino = () => {
    if (!nome || !series || !repeticoes) return;

    const novoTreino = {
      id: Date.now().toString(),
      nome,
      series,
      repeticoes,
      peso: peso || 0,
      grupo,
      data: new Date().toLocaleDateString(),
    };
    setTreinos([...treinos, novoTreino]);
    setNome("");
    setSeries("");
    setRepeticoes("");
    setPeso("");
    setGrupo("Peito");
  };

  const excluirTreino = (id) => {
    setTreinos(treinos.filter((t) => t.id !== id));
  };

  const theme = darkMode ? estilos.dark : estilos.light;

  // Agrupar treinos por grupo
  const gruposArray = Object.values(
    treinos.reduce((acc, t) => {
      if (!acc[t.grupo]) acc[t.grupo] = { grupo: t.grupo, data: [] };
      acc[t.grupo].data.push(t);
      return acc;
    }, {})
  );

  // Estatísticas
  const totalExercicios = treinos.length;
  const totalSeries = treinos.reduce((acc, t) => acc + Number(t.series), 0);
  const totalRepeticoes = treinos.reduce(
    (acc, t) => acc + Number(t.series) * Number(t.repeticoes),
    0
  );
  const totalPeso = treinos.reduce(
    (acc, t) => acc + Number(t.peso || 0) * Number(t.series) * Number(t.repeticoes),
    0
  );

  const renderTreino = ({ item }) => (
    <View style={theme.item}>
      <Text style={theme.itemTexto}>
        {item.data} – {item.nome} → {item.series}x{item.repeticoes} ({item.peso}kg)
      </Text>
      <TouchableOpacity
        style={theme.botaoExcluirCompacto}
        onPress={() => excluirTreino(item.id)}
      >
        <Text style={theme.excluirTexto}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGrupo = ({ item }) => (
    <View style={theme.grupoBox}>
      <Text style={theme.grupoTitulo}>{item.grupo}</Text>
      <FlatList
        data={item.data}
        keyExtractor={(t) => t.id}
        renderItem={renderTreino}
      />
    </View>
  );

  return (
    <View style={theme.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={theme.titulo}>🏋️‍♂️ Meus Treinos</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: darkMode ? "#F9FAFB" : "#111827", marginRight: 8 }}>
            {darkMode ? "Escuro" : "Claro"}
          </Text>
          <Switch
            value={darkMode}
            onValueChange={() => setDarkMode(!darkMode)}
            trackColor={{ false: "#767577", true: "#3B82F6" }}
            thumbColor={darkMode ? "#f9fafb" : "#111827"}
          />
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
          <Picker.Item label="Peito" value="Peito" />
          <Picker.Item label="Costas" value="Costas" />
          <Picker.Item label="Pernas" value="Pernas" />
          <Picker.Item label="Ombros" value="Ombros" />
          <Picker.Item label="Braços" value="Braços" />
          <Picker.Item label="Abdômen" value="Abdômen" />
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

      {/* Lista de treinos */}
      <FlatList
        data={gruposArray}
        keyExtractor={(g) => g.grupo}
        renderItem={renderGrupo}
        style={theme.lista}
      />
    </View>
  );
}

// --- estilos light/dark ---
const estilos = {
  light: StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
    titulo: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#111827" },
    input: {
      borderWidth: 1,
      borderColor: "#E5E7EB",
      backgroundColor: "#fff",
      padding: 12,
      marginBottom: 10,
      borderRadius: 10,
      color: "#111827",
    },
    pickerBox: {
      borderWidth: 1,
      borderColor: "#E5E7EB",
      backgroundColor: "#fff",
      borderRadius: 10,
      marginBottom: 10,
    },
    botao: {
      backgroundColor: "#3B82F6",
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 20,
    },
    botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    lista: { marginTop: 10 },
    grupoBox: { marginBottom: 20 },
    grupoTitulo: { fontSize: 20, fontWeight: "600", marginBottom: 8, color: "#1F2937" },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      backgroundColor: "#fff",
      borderRadius: 8,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    itemTexto: { fontSize: 15, color: "#374151", flexShrink: 1 },
    botaoExcluirCompacto: {