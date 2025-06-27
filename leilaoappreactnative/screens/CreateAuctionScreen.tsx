import { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
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
import { Auctioneer } from "./AuctioneersScreen";
import { Address } from "./AddressScreen";

type Props = DrawerScreenProps<DrawerParamList, "CreateAuction">;

const CreateAuctionScreen = ({ navigation }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);
  const [selectedAddressesText, setSelectedAddressesText] = useState("");
  const [auctioneers, setAuctioneers] = useState<Auctioneer[]>([]);
  const [selectedAuctioneer, setSelectedAuctioneer] = useState<number | null>(
    null
  );
  const [selectedAuctioneerName, setSelectedAuctioneerName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [addressDropdownVisible, setAddressDropdownVisible] = useState(false);
  const [auctioneerDropdownVisible, setAuctioneerDropdownVisible] =
    useState(false);

  const formatDateForInput = (date: any) => {
    const pad = (n: any) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [addrRes, aucRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/endereco/"),
        fetch("http://127.0.0.1:8000/leiloeiro/"),
      ]);
      if (addrRes.ok && aucRes.ok) {
        const [addrData, aucData] = await Promise.all([
          addrRes.json(),
          aucRes.json(),
        ]);
        setAddresses(addrData);
        setAuctioneers(aucData);
      } else {
        Alert.alert("Erro", "Não foi possível carregar os dados");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão ao carregar dados");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAddresses.length === 0) {
      setSelectedAddressesText("");
    } else if (selectedAddresses.length === 1) {
      const address = addresses.find(
        (addr) => addr.id === selectedAddresses[0]
      );
      if (address) {
        setSelectedAddressesText(
          `${address.street}, ${address.number} - ${address.city} - ${address.state}`
        );
      }
    } else {
      setSelectedAddressesText(
        `${selectedAddresses.length} endereços selecionados`
      );
    }
  }, [selectedAddresses, addresses]);

  useFocusEffect(
    useCallback(() => {
      setTitle("");
      setDescription("");
      setSelectedAddresses([]);
      setSelectedAddressesText("");
      setSelectedAuctioneer(null);
      setSelectedAuctioneerName("");
      setStartDate(new Date());
      setEndDate(new Date());
      setAddressDropdownVisible(false);
      setAuctioneerDropdownVisible(false);
    }, [])
  );

  const handleAddressSelect = (address: Address) => {
    setSelectedAddresses((prev) => {
      if (prev.includes(address.id)) {
        return prev.filter((id) => id !== address.id);
      } else {
        return [...prev, address.id];
      }
    });
  };

  const handleAuctioneerSelect = (auctioneer: Auctioneer) => {
    setSelectedAuctioneer(auctioneer.id);
    setSelectedAuctioneerName(`${auctioneer.name} - ${auctioneer.email}`);
    setAuctioneerDropdownVisible(false);
  };

  const handleDateChange = (
    date: string,
    setter: React.Dispatch<React.SetStateAction<Date | null>>
  ) => {
    const newDate = date ? new Date(date) : null;
    setter(newDate);
  };

  const handleSave = async () => {
    if (startDate === null || endDate === null) {
      Alert.alert("Erro", "Por favor, selecione as datas.");
      return;
    }
    if (selectedAddresses.length === 0) {
      Alert.alert("Erro", "Por favor, selecione pelo menos um endereço.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/leilao/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          address: selectedAddresses,
          auctioneer: selectedAuctioneer,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
      });
      if (res.ok) {
        navigation.navigate("Auctions");
      } else {
        Alert.alert("Erro", "Não foi possível salvar o leilão");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão ao salvar leilão");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          <Text style={styles.title}>Novo leilão</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholder="Digite o título do leilão"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textArea]}
              placeholder="Digite a descrição do leilão"
              textAlignVertical="top"
              multiline
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Endereços{" "}
              {selectedAddresses.length > 0 &&
                `(${selectedAddresses.length} selecionados)`}
            </Text>
            {loadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4B7BE5" />
                <Text style={styles.loadingText}>Carregando endereços...</Text>
              </View>
            ) : (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    addressDropdownVisible && styles.selectButtonActive,
                  ]}
                  onPress={() => {
                    setAddressDropdownVisible(!addressDropdownVisible);
                    setAuctioneerDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      !selectedAddressesText && styles.placeholder,
                    ]}
                  >
                    {selectedAddressesText || "Selecione os endereços"}
                  </Text>
                  <Text
                    style={[
                      styles.selectArrow,
                      addressDropdownVisible && styles.selectArrowUp,
                    ]}
                  >
                    ▼
                  </Text>
                </TouchableOpacity>
                {addressDropdownVisible && (
                  <View style={styles.dropdownList}>
                    <FlatList
                      data={addresses}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            selectedAddresses.includes(item.id) &&
                              styles.selectedDropdownItem,
                          ]}
                          onPress={() => handleAddressSelect(item)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedAddresses.includes(item.id) &&
                                styles.selectedDropdownItemText,
                            ]}
                          >
                            {`${item.street}, ${item.number} - ${item.city} - ${item.state}`}
                          </Text>
                          {selectedAddresses.includes(item.id) && (
                            <Text style={styles.checkMark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      )}
                      style={styles.dropdownFlatList}
                      nestedScrollEnabled={true}
                    />
                    {selectedAddresses.length > 0 && (
                      <View style={styles.dropdownFooter}>
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => setSelectedAddresses([])}
                        >
                          <Text style={styles.clearButtonText}>
                            Limpar seleção
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.doneButton}
                          onPress={() => setAddressDropdownVisible(false)}
                        >
                          <Text style={styles.doneButtonText}>Concluído</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Responsável</Text>
            {loadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4B7BE5" />
                <Text style={styles.loadingText}>
                  Carregando responsáveis...
                </Text>
              </View>
            ) : (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    auctioneerDropdownVisible && styles.selectButtonActive,
                  ]}
                  onPress={() => {
                    setAuctioneerDropdownVisible(!auctioneerDropdownVisible);
                    setAddressDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      !selectedAuctioneerName && styles.placeholder,
                    ]}
                  >
                    {selectedAuctioneerName || "Selecione um responsável"}
                  </Text>
                  <Text
                    style={[
                      styles.selectArrow,
                      auctioneerDropdownVisible && styles.selectArrowUp,
                    ]}
                  >
                    ▼
                  </Text>
                </TouchableOpacity>
                {auctioneerDropdownVisible && (
                  <View style={styles.dropdownList}>
                    <FlatList
                      data={auctioneers}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            selectedAuctioneer === item.id &&
                              styles.selectedDropdownItem,
                          ]}
                          onPress={() => handleAuctioneerSelect(item)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedAuctioneer === item.id &&
                                styles.selectedDropdownItemText,
                            ]}
                          >
                            {`${item.name} - ${item.email}`}
                          </Text>
                          {selectedAuctioneer === item.id && (
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data inicial</Text>
            <input
              type="datetime-local"
              value={startDate ? formatDateForInput(startDate) : ""}
              onChange={(e) => handleDateChange(e.target.value, setStartDate)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de término</Text>
            <input
              type="datetime-local"
              value={endDate ? formatDateForInput(endDate) : ""}
              onChange={(e) => handleDateChange(e.target.value, setEndDate)}
            />
          </View>
        </View>
      </ScrollView>
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
            onPress={() => navigation.navigate("Auctions")}
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
    minHeight: 56,
  },
  selectButtonActive: {
    borderColor: "#4B7BE5",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#FFFFFF",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
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
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4B7BE5",
    borderTopWidth: 0,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
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
    backgroundColor: "#fff",
    zIndex: 2000,
  },
  selectedDropdownItem: {
    backgroundColor: "#EBF4FF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
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
  dropdownFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  clearButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#4B7BE5",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingText: {
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

export default CreateAuctionScreen;
