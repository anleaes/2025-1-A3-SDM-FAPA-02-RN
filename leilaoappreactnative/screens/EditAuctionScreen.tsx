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
import { Address } from "./AddressScreen";
import { Auctioneer } from "./AuctioneersScreen";
import { Item } from "./ItemsScreen";

type Props = DrawerScreenProps<DrawerParamList, "EditAuction">;

const EditAuctionScreen = ({ route, navigation }: Props) => {
  const { auction } = route.params;

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
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAuctionData, setLoadingAuctionData] = useState(true);
  const [addressDropdownVisible, setAddressDropdownVisible] = useState(false);
  const [auctioneerDropdownVisible, setAuctioneerDropdownVisible] =
    useState(false);
  const [itemDropdownVisible, setItemDropdownVisible] = useState(false);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [addrRes, aucRes, itemRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/endereco/"),
        fetch("http://127.0.0.1:8000/leiloeiro/"),
        fetch("http://127.0.0.1:8000/item/"),
      ]);
      if (addrRes.ok && aucRes.ok && itemRes.ok) {
        const [addrData, aucData, itemData] = await Promise.all([
          addrRes.json(),
          aucRes.json(),
          itemRes.json(),
        ]);
        setAddresses(addrData);
        setAuctioneers(aucData);
        setItems(itemData);
      } else {
        Alert.alert("Erro", "Não foi possível carregar os dados");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão ao carregar dados");
    } finally {
      setLoadingData(false);
    }
  };

  const formatDateForInput = (date: any) => {
    const pad = (n: any) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  const fetchAuctionDetails = async () => {
    try {
      setLoadingAuctionData(true);

      let addressIds: number[] = [];

      if (auction.address) {
        if (Array.isArray(auction.address)) {
          addressIds = auction.address
            .map((addr: any) => {
              if (typeof addr === "object" && addr.id) {
                return addr.id;
              }
              return typeof addr === "number" ? addr : parseInt(addr);
            })
            .filter((id) => !isNaN(id));
        } else {
          const addressId =
            typeof auction.address === "object" && (auction.address as any).id
              ? (auction.address as any).id
              : auction.address;

          const parsedId =
            typeof addressId === "number" ? addressId : parseInt(addressId);
          if (!isNaN(parsedId)) {
            addressIds = [parsedId];
          }
        }
      }

      if (addressIds.length > 0) {
        setSelectedAddresses(addressIds);
      }

      const auctioneerId =
        typeof auction.auctioneer === "object"
          ? auction.auctioneer.id
          : auction.auctioneer;

      const itemId = auction.item
        ? typeof auction.item === "object"
          ? auction.item.id
          : auction.item
        : null;

      const promises = [
        fetch(`http://127.0.0.1:8000/leiloeiro/${auctioneerId}/`),
      ];

      if (itemId) {
        promises.push(fetch(`http://127.0.0.1:8000/item/${itemId}/`));
      }

      const responses = await Promise.all(promises);
      const auctioneerRes = responses[0];
      const itemRes = responses[1];

      if (auctioneerRes.ok) {
        const auctioneerData = await auctioneerRes.json();
        setSelectedAuctioneer(auctioneerData.id);
        setSelectedAuctioneerName(
          `${auctioneerData.name} - ${auctioneerData.email}`
        );
      }

      if (itemRes && itemRes.ok) {
        const itemData = await itemRes.json();
        setSelectedItem(itemData.id);
        setSelectedItemName(itemData.name);
      } else if (auction.item) {
        setSelectedItem(
          typeof auction.item === "object" ? auction.item.id : auction.item
        );
        setSelectedItemName(
          typeof auction.item === "object" ? auction.item.name : ""
        );
      }

      setTitle(auction.title);
      setDescription(auction.description);
      setStartDate(new Date(auction.start_date));
      setEndDate(new Date(auction.end_date));
    } catch (error) {
      console.error("Erro ao carregar detalhes do leilão:", error);
      Alert.alert("Erro", "Erro ao carregar detalhes do leilão");

      if (auction.address) {
        if (Array.isArray(auction.address)) {
          const ids = auction.address
            .map((addr: any) =>
              typeof addr === "object" && addr.id ? addr.id : addr
            )
            .filter((id) => typeof id === "number");
          setSelectedAddresses(ids);
        } else {
          const addressId =
            typeof auction.address === "object" && (auction.address as any).id
              ? (auction.address as any).id
              : auction.address;
          if (typeof addressId === "number") {
            setSelectedAddresses([addressId]);
          }
        }
      }

      setTitle(auction.title);
      setDescription(auction.description);
      setStartDate(new Date(auction.start_date));
      setEndDate(new Date(auction.end_date));
    } finally {
      setLoadingAuctionData(false);
    }
  };

  useEffect(() => {
    if (
      !loadingData &&
      !loadingAuctionData &&
      addresses.length > 0 &&
      selectedAddresses.length > 0
    ) {
      if (selectedAddresses.length === 1) {
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
    }
  }, [loadingData, loadingAuctionData, addresses, selectedAddresses]);

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
      const loadData = async () => {
        await fetchData();
        await fetchAuctionDetails();
        setAddressDropdownVisible(false);
        setAuctioneerDropdownVisible(false);
        setItemDropdownVisible(false);
      };

      loadData();
    }, [auction])
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

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item.id);
    setSelectedItemName(item.name);
    setItemDropdownVisible(false);
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

    if (
      !title.trim() ||
      !description.trim() ||
      selectedAddresses.length === 0 ||
      !selectedAuctioneer ||
      !selectedItem
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    if (startDate >= endDate) {
      Alert.alert(
        "Erro",
        "A data de início deve ser anterior à data de término"
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/leilao/${auction.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          address: selectedAddresses,
          auctioneer: selectedAuctioneer,
          item: selectedItem,
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
          <Text style={styles.title}>Editar leilão</Text>

          {loadingAuctionData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B7BE5" />
              <Text style={styles.loadingText}>
                Carregando dados do leilão...
              </Text>
            </View>
          ) : (
            <>
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
                    <Text style={styles.loadingText}>
                      Carregando endereços...
                    </Text>
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
                        setItemDropdownVisible(false);
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
                              <Text style={styles.doneButtonText}>
                                Concluído
                              </Text>
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
                        setAuctioneerDropdownVisible(
                          !auctioneerDropdownVisible
                        );
                        setAddressDropdownVisible(false);
                        setItemDropdownVisible(false);
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
                <Text style={styles.label}>Item</Text>
                {loadingData ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4B7BE5" />
                    <Text style={styles.loadingText}>Carregando itens...</Text>
                  </View>
                ) : (
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        itemDropdownVisible && styles.selectButtonActive,
                      ]}
                      onPress={() => {
                        setItemDropdownVisible(!itemDropdownVisible);
                        setAddressDropdownVisible(false);
                        setAuctioneerDropdownVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.selectButtonText,
                          !selectedItemName && styles.placeholder,
                        ]}
                      >
                        {selectedItemName || "Selecione um item"}
                      </Text>
                      <Text
                        style={[
                          styles.selectArrow,
                          itemDropdownVisible && styles.selectArrowUp,
                        ]}
                      >
                        ▼
                      </Text>
                    </TouchableOpacity>
                    {itemDropdownVisible && (
                      <View style={styles.dropdownList}>
                        <FlatList
                          data={items}
                          keyExtractor={(item) => item.id.toString()}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={[
                                styles.dropdownItem,
                                selectedItem === item.id &&
                                  styles.selectedDropdownItem,
                              ]}
                              onPress={() => handleItemSelect(item)}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  selectedItem === item.id &&
                                    styles.selectedDropdownItemText,
                                ]}
                              >
                                {item.name}
                              </Text>
                              {selectedItem === item.id && (
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
                  onChange={(e) =>
                    handleDateChange(e.target.value, setStartDate)
                  }
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
            </>
          )}
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

    maxHeight: 200,
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
});

export default EditAuctionScreen;
