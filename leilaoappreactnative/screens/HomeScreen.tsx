import { DrawerScreenProps } from "@react-navigation/drawer";
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { DrawerParamList } from "../navigation/DrawerNavigator";

type Props = DrawerScreenProps<DrawerParamList, "Home">;

const HomeScreen = ({ navigation }: Props) => (
  <View style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.welcomeText}>Seja Bem-vindo</Text>
      <Text style={styles.systemTitle}>Sistema de Gestão de Leilões</Text>

      <View style={styles.developerInfo}>
        <Text style={styles.developedByText}>Desenvolvido por:</Text>
        <Text style={styles.developerName}>Leandro Golub de Oliveira</Text>
        <Text style={styles.registrationNumber}>1292323511</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  systemTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#34495e",
    textAlign: "center",
    marginBottom: 40,
  },
  developerInfo: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  developedByText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  developerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 4,
  },
  registrationNumber: {
    fontSize: 14,
    color: "#95a5a6",
    fontWeight: "500",
  },
});

export default HomeScreen;
