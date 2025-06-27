import { Ionicons } from "@expo/vector-icons";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DrawerParamList } from "../navigation/DrawerNavigator";
import { Address } from "./AddressScreen";
import { Auctioneer } from "./AuctioneersScreen";
import { Item } from "./ItemsScreen";

type Props = DrawerScreenProps<DrawerParamList, "Auctions">;

export type Auction = {
  id: number;
  title: string;
  description: string;
  address: number[] | Address[];
  start_date: Date;
  end_date: Date;
  auctioneer: number | Auctioneer;
  item: Item | null;
};

export type AuctionWithDetails = {
  id: number;
  title: string;
  description: string;
  address: Address[];
  start_date: Date;
  end_date: Date;
  auctioneer: Auctioneer;
  item: Item | null;
};

const AuctionsScreen = ({ navigation }: Props) => {
  const [auctions, setAuctions] = useState<AuctionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddressById = async (addressId: number): Promise<Address> => {
    const response = await fetch(
      `http://127.0.0.1:8000/endereco/${addressId}/`
    );
    return await response.json();
  };

  const fetchAuctioneerById = async (
    auctioneerId: number
  ): Promise<Auctioneer> => {
    const response = await fetch(
      `http://127.0.0.1:8000/leiloeiro/${auctioneerId}/`
    );
    return await response.json();
  };

  const getId = (entity: number | { id: number }): number => {
    return typeof entity === "number" ? entity : entity.id;
  };

  const getAddressIds = (addresses: number[] | Address[]): number[] => {
    return addresses.map((address) => getId(address));
  };

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/leilao/");
      const data: Auction[] = await response.json();

      const auctionsWithDetails: AuctionWithDetails[] = await Promise.all(
        data.map(async (auction) => {
          const addressIds = getAddressIds(auction.address);

          const [addresses, auctioneer] = await Promise.all([
            Promise.all(addressIds.map((id) => fetchAddressById(id))),
            fetchAuctioneerById(getId(auction.auctioneer)),
          ]);

          return {
            id: auction.id,
            title: auction.title,
            description: auction.description,
            start_date: new Date(auction.start_date),
            end_date: new Date(auction.end_date),
            address: addresses,
            auctioneer,
            item: auction.item,
          };
        })
      );

      setAuctions(auctionsWithDetails);
    } catch (error) {
      console.error("Erro ao carregar leilões:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAuctions();
    }, [])
  );

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/leilao/${id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAuctions((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Erro ao excluir leilão:", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddresses = (addresses: Address[]) => {
    if (addresses.length === 0) return "Nenhum endereço";
    if (addresses.length === 1) {
      const addr = addresses[0];
      return `${addr.street}, ${addr.number} - ${addr.city}/${addr.state}`;
    }
    return `${addresses.length} endereços cadastrados`;
  };

  const renderItem = ({ item }: { item: AuctionWithDetails }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.infoContainer}>
            <View style={styles.dateContainer}>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.dateLabel}>Início:</Text>
                <Text style={styles.dateText}>
                  {formatDate(item.start_date)}
                </Text>
              </View>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.dateLabel}>Término:</Text>
                <Text style={styles.dateText}>{formatDate(item.end_date)}</Text>
              </View>
            </View>

            <View style={styles.auctioneerContainer}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Responsável:</Text>
              <Text style={styles.infoText}>{item.auctioneer.name}</Text>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Endereço:</Text>
              <Text style={styles.infoText} numberOfLines={2}>
                {formatAddresses(item.address)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              const auctionForNavigation: Auction = {
                id: item.id,
                title: item.title,
                description: item.description,
                address: item.address.map((addr) => addr.id),
                start_date: item.start_date,
                end_date: item.end_date,
                auctioneer: item.auctioneer.id,
                item: item.item,
              };
              navigation.navigate("EditAuction", {
                auction: auctionForNavigation,
              });
            }}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.visualizeButton}
          onPress={() => {
            const auctionForNavigation: Auction = {
              id: item.id,
              title: item.title,
              description: item.description,
              address: item.address.map((addr) => addr.id),
              start_date: item.start_date,
              end_date: item.end_date,
              auctioneer: item.auctioneer.id,
              item: item.item,
            };
            navigation.navigate("VisualizeAuction", {
              auction: auctionForNavigation,
            });
          }}
        >
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.buttonText}>Visualizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhum leilão encontrado</Text>
      <Text style={styles.emptyDescription}>
        Toque no botão + para criar seu primeiro leilão.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leilões</Text>
        <Text style={styles.subtitle}>
          {auctions.length} {auctions.length === 1 ? "leilão" : "leilões"}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B7BE5" />
          <Text style={styles.loadingText}>Carregando leilões...</Text>
        </View>
      ) : (
        <FlatList
          data={auctions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateAuction")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  textContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
  },
  infoContainer: {
    gap: 12,
  },
  dateContainer: {
    gap: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  auctioneerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4B7BE5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  visualizeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "green",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4B7BE5",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default AuctionsScreen;
