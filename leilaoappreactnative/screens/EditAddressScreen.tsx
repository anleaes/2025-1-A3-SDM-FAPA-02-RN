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

type Props = DrawerScreenProps<DrawerParamList, "EditAddress">;

const EditAddressScreen = ({ route, navigation }: Props) => {
  const { address } = route.params;

  const [street, setStreet] = useState(address.street);
  const [number, setNumber] = useState(address.number);
  const [city, setCity] = useState(address.city);
  const [state, setState] = useState(address.state);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStreet(address.street);
    setNumber(address.number);
    setCity(address.city);
    setState(address.state);
  }, [address]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`http://127.0.0.1:8000/endereco/${address.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ street, number, city, state }),
    });
    navigation.navigate("Address");
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.title}>Editar endereço</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rua</Text>
          <TextInput
            value={street}
            onChangeText={setStreet}
            style={styles.input}
            placeholder="Ex: Av. Brasil"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            value={number}
            onChangeText={setNumber}
            style={styles.input}
            placeholder="Ex: 123"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholder="Ex: São Paulo"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            value={state}
            onChangeText={setState}
            style={styles.input}
            placeholder="Ex: SP"
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
            onPress={() => navigation.navigate("Address")}
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

export default EditAddressScreen;
