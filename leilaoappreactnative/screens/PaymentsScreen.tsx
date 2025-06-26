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

type Props = DrawerScreenProps<DrawerParamList, "Payments">;

export type Payment = {
  id: number;
  amount_paid: number;
  status: "PENDING" | "COMPLETED";
  bidder: number;
  auction: number;
  item: number;
};

type EnrichedPayment = {
  id: number;
  amount_paid: number;
  status: "PENDING" | "COMPLETED";
  bidderName: string;
  auctionName: string;
  itemName: string;
  bidderId: number;
  auctionId: number;
  itemId: number;
};

const PaymentsScreen = ({ navigation }: Props) => {
  const [payments, setPayments] = useState<EnrichedPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async (url: string, id: number): Promise<string> => {
    const res = await fetch(`${url}/${id}/`);

    if (!res.ok) {
      console.error(`Erro ao buscar ${url}/${id}:`, res.status);
      return "Desconhecido";
    }

    const data = await res.json();
    return data.name || data.title;
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/pagamento/");

      if (!res.ok) {
        console.error("Erro ao buscar pagamentos:", res.status);
        setPayments([]);
        setLoading(false);
        return;
      }

      const data: Payment[] = await res.json();

      const enriched = await Promise.all(
        data.map(async (payment) => {
          const bidderName = await fetchDetails(
            "http://127.0.0.1:8000/ofertante",
            payment.bidder
          );
          const auctionName = await fetchDetails(
            "http://127.0.0.1:8000/leilao",
            payment.auction
          );
          const itemName = await fetchDetails(
            "http://127.0.0.1:8000/item",
            payment.item
          );

          return {
            id: payment.id,
            amount_paid: Number(payment.amount_paid),
            status: payment.status,
            bidderName,
            auctionName,
            itemName,
            bidderId: payment.bidder,
            auctionId: payment.auction,
            itemId: payment.item,
          };
        })
      );

      setPayments(enriched);
    } catch (error) {
      console.error("Erro geral ao buscar pagamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const handleDelete = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/pagamento/${id}/`, {
      method: "DELETE",
    });
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const getStatusText = (status: "PENDING" | "COMPLETED") => {
    return status === "PENDING" ? "Pendente" : "Completo";
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhum pagamento encontrado</Text>
    </View>
  );

  const renderItem = ({ item }: { item: EnrichedPayment }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.name}>R$ {item.amount_paid.toFixed(2)}</Text>

          <Text style={styles.description}>
            Status: {getStatusText(item.status)}
          </Text>
          <Text style={styles.description}>Responsável: {item.bidderName}</Text>
          <Text style={styles.description}>Leilão: {item.auctionName}</Text>
          <Text style={styles.description}>Item: {item.itemName}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() =>
              navigation.navigate("Payment", {
                payment: {
                  id: item.id,
                  amount_paid: item.amount_paid,
                  status: item.status,
                  bidder: item.bidderId,
                  auction: item.auctionId,
                  item: item.itemId,
                },
              })
            }
          >
            <Ionicons name="cash-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>Pagar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagamentos</Text>
        <Text style={styles.subtitle}>
          {payments.length} {payments.length === 1 ? "pagamento" : "pagamentos"}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B7BE5" />
          <Text style={styles.loadingText}>Carregando pagamentos...</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  title: {
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
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#109910",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
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

export default PaymentsScreen;
