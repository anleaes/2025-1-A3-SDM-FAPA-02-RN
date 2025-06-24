import { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DrawerParamList } from "../navigation/DrawerNavigator";

type Props = DrawerScreenProps<DrawerParamList, "EditCategory">;

const EditCategoryScreen = ({ route, navigation }: Props) => {
  const { category } = route.params;
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(category.name);
    setDescription(category.description);
  }, [category]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`http://127.0.0.1:8000/categoria/${category.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    navigation.navigate("Categories");
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.title}>Editar Categoria</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Digite o nome da categoria"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Digite a descrição da categoria"
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={styles.buttonSection}>
        {saving ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B7BE5" />
            <Text style={styles.loadingText}>Salvando...</Text>
          </View>
        ) : (
          <View style={styles.saveButton}>
            <Button title="Salvar" onPress={handleSave} color="#4B7BE5" />
          </View>
        )}

        <View style={styles.backButton}>
          <Button
            title="Voltar"
            onPress={() => navigation.navigate("Categories")}
            color="#6B7280"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  formSection: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  buttonSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  saveButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#4B7BE5",
  },
  backButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default EditCategoryScreen;
