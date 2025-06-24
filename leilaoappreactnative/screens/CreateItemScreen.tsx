import { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { DrawerParamList } from "../navigation/DrawerNavigator";

type Props = DrawerScreenProps<DrawerParamList, "CreateItem">;

interface Category {
  id: number;
  name: string;
}

const CreateItemScreen = ({ navigation }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startingValue, setStartingValue] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("http://127.0.0.1:8000/categoria/");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        Alert.alert("Erro", "Não foi possível carregar as categorias");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão ao carregar categorias");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setName("");
      setDescription("");
      setStartingValue("");
      setCategoryId(null);
      setSelectedCategoryName("");
      setDropdownVisible(false);
    }, [])
  );

  const handleCategorySelect = (selectedCategory: Category) => {
    setCategoryId(selectedCategory.id);
    setSelectedCategoryName(selectedCategory.name);
    setDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSave = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      !startingValue.trim() ||
      !categoryId
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    const numericValue = parseFloat(startingValue.replace(",", "."));
    if (isNaN(numericValue) || numericValue < 0) {
      Alert.alert("Erro", "Por favor, digite um valor inicial válido");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/item/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          starting_value: numericValue,
          category: categoryId,
        }),
      });

      if (res.ok) {
        navigation.navigate("Items");
      } else {
        Alert.alert("Erro", "Não foi possível salvar o item");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão ao salvar item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.title}>Novo item</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Digite o nome do item"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Digite a descrição do item"
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor inicial</Text>
          <TextInput
            value={startingValue}
            onChangeText={setStartingValue}
            style={styles.input}
            placeholder="0,00"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria</Text>
          {loadingCategories ? (
            <View style={styles.loadingCategoriesContainer}>
              <ActivityIndicator size="small" color="#4B7BE5" />
              <Text style={styles.loadingCategoriesText}>
                Carregando categorias...
              </Text>
            </View>
          ) : (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  dropdownVisible && styles.selectButtonActive,
                ]}
                onPress={toggleDropdown}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    !selectedCategoryName && styles.placeholder,
                  ]}
                >
                  {selectedCategoryName || "Selecione uma categoria"}
                </Text>
                <Text
                  style={[
                    styles.selectArrow,
                    dropdownVisible && styles.selectArrowUp,
                  ]}
                >
                  ▼
                </Text>
              </TouchableOpacity>

              {dropdownVisible && (
                <View style={styles.dropdownList}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          categoryId === item.id && styles.selectedDropdownItem,
                        ]}
                        onPress={() => handleCategorySelect(item)}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            categoryId === item.id &&
                              styles.selectedDropdownItemText,
                          ]}
                        >
                          {item.name}
                        </Text>
                        {categoryId === item.id && (
                          <Text style={styles.checkMark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    style={styles.dropdownFlatList}
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
            </View>
          )}
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
            onPress={() => navigation.navigate("Items")}
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
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
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
  selectButtonActive: {
    borderColor: "#4B7BE5",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  placeholder: {
    color: "#9CA3AF",
  },
  selectArrow: {
    fontSize: 12,
    color: "#6B7280",
    transform: [{ rotate: "0deg" }],
  },
  selectArrowUp: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4B7BE5",
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownFlatList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedDropdownItem: {
    backgroundColor: "#EBF4FF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedDropdownItemText: {
    color: "#4B7BE5",
    fontWeight: "500",
  },
  checkMark: {
    fontSize: 16,
    color: "#4B7BE5",
    fontWeight: "bold",
  },
  loadingCategoriesContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
  },
  loadingCategoriesText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#6B7280",
  },
  buttonSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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

export default CreateItemScreen;
