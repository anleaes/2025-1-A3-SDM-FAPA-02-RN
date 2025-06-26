import { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { DrawerParamList } from "../navigation/DrawerNavigator";

type Props = DrawerScreenProps<DrawerParamList, "Payment">;

interface PaymentDetails {
  id: number;
  amount_paid: number;
  status: string;
  auction: number;
  item: number;
  bidder: number;
}

interface AuctionData {
  title: string;
}

interface ItemData {
  name: string;
}

interface BidderData {
  name: string;
}

const PayScreen = ({ route, navigation }: Props) => {
  const { payment } = route.params;
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(payment);
  const [currentStatus, setCurrentStatus] = useState(payment.status);
  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [bidderData, setBidderData] = useState<BidderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setCurrentStatus(payment.status);
    setPaymentDetails(payment); // Atualizar também os detalhes
  }, [payment]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);

        const auctionResponse = await fetch(
          `http://127.0.0.1:8000/leilao/${payment.auction}/`
        );
        const auctionData = await auctionResponse.json();
        setAuctionData(auctionData);

        const itemResponse = await fetch(
          `http://127.0.0.1:8000/item/${payment.item}/`
        );
        const itemData = await itemResponse.json();
        setItemData(itemData);

        const bidderResponse = await fetch(
          `http://127.0.0.1:8000/ofertante/${payment.bidder}/`
        );
        const bidderData = await bidderResponse.json();
        setBidderData(bidderData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do pagamento.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [payment]);

  const handlePayment = async () => {
    if (currentStatus === "COMPLETED" || payment.status === "COMPLETED") {
      Alert.alert("Aviso", "Este pagamento já foi processado!");
      return;
    }
    setShowConfirmModal(true);
  };

  const processPayment = async () => {
    try {
      setPaying(true);

      const response = await fetch(
        `http://127.0.0.1:8000/pagamento/${payment.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...paymentDetails,
            status: "COMPLETED",
          }),
        }
      );

      if (response.ok) {
        setCurrentStatus("COMPLETED");
        setShowSuccessModal(true);
      } else {
        throw new Error("Erro ao processar pagamento");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      setErrorMessage(
        "Não foi possível processar o pagamento. Tente novamente."
      );
      setShowErrorModal(true);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4B7BE5" />
        <Text style={styles.loadingText}>Carregando dados do pagamento...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentSection}>
        <Text style={styles.title}>Detalhes do Pagamento</Text>

        <View style={styles.card}>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Leilão</Text>
            <Text style={styles.value}>
              {auctionData?.title || "Carregando..."}
            </Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Item</Text>
            <Text style={styles.value}>
              {itemData?.name || "Carregando..."}
            </Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Ofertante</Text>
            <Text style={styles.value}>
              {bidderData?.name || "Carregando..."}
            </Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Valor a Pagar</Text>
            <Text style={styles.amountValue}>
              R$ {paymentDetails.amount_paid.toFixed(2)}
            </Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                currentStatus === "COMPLETED"
                  ? styles.statusCompleted
                  : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  currentStatus === "COMPLETED"
                    ? styles.statusCompletedText
                    : styles.statusPendingText,
                ]}
              >
                {currentStatus === "COMPLETED" ? "PAGO" : "PENDENTE"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonSection}>
        {paying ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B7BE5" />
            <Text style={styles.loadingText}>Processando pagamento...</Text>
          </View>
        ) : (
          <>
            {currentStatus !== "COMPLETED" && (
              <View style={styles.payButton}>
                <Button
                  title="Pagar"
                  onPress={() => {
                    handlePayment();
                  }}
                  color="#10B981"
                />
              </View>
            )}
            <View style={styles.backButton}>
              <Button
                title="Voltar"
                onPress={() => navigation.navigate("Payments")}
                color="#6B7280"
              />
            </View>
          </>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Pagamento</Text>
            <Text style={styles.modalMessage}>
              Confirma o pagamento de R$ {paymentDetails.amount_paid.toFixed(2)}
              ?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                  processPayment();
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sucesso!</Text>
            <Text style={styles.modalMessage}>
              Pagamento processado com sucesso!
            </Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                { width: "100%" },
              ]}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("Payments");
              }}
            >
              <Text style={styles.confirmButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Erro</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { width: "100%" },
              ]}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.cancelButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentSection: {
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1F2937",
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusCompleted: {
    backgroundColor: "#D1FAE5",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusCompletedText: {
    color: "#065F46",
  },
  statusPendingText: {
    color: "#92400E",
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
  payButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#10B981",
  },
  backButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  confirmButton: {
    backgroundColor: "#10B981",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default PayScreen;
