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

type Props = DrawerScreenProps<DrawerParamList, "EditAuctioneer">;

const EditAuctioneerScreen = ({ route, navigation }: Props) => {
  const { auctioneer } = route.params;
  const [name, setName] = useState(auctioneer.name);
  const [email, setEmail] = useState(auctioneer.email);
  const [phone, setPhone] = useState(auctioneer.phone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(auctioneer.name);
    setEmail(auctioneer.email);
    setPhone(auctioneer.phone);
  }, [auctioneer]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`http://127.0.0.1:8000/leiloeiro/${auctioneer.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    setSaving(false);
    navigation.navigate("Auctioneers");
  };

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.title}>Editar leiloeiro</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Digite o nome do leiloeiro"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="exemplo@email.com.br"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="(XX) XXXXX-XXXX"
            keyboardType="phone-pad"
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
            onPress={() => navigation.navigate("Auctioneers")}
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

export default EditAuctioneerScreen;
