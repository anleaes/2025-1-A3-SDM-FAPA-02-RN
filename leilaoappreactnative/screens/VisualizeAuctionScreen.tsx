import { DrawerScreenProps } from "@react-navigation/drawer";
import { ScrollView } from "react-native-gesture-handler";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import { Picker } from "@react-native-picker/picker";
import { DrawerParamList } from "../navigation/DrawerNavigator";
import { Address } from "./AddressScreen";
import { Auctioneer } from "./AuctioneersScreen";
import { Item } from "./ItemsScreen";

type Props = DrawerScreenProps<DrawerParamList, "VisualizeAuction">;

interface AuctionDetails {
  id: number;
  title: string;
  description: string;
  address: Address[];
  start_date: Date;
  end_date: Date;
  auctioneer: Auctioneer;
  item: Item | null;
}

interface Bidder {
  id: number;
  name: string;
}

interface Bid {
  id: number;
  amount: number;
  date_time: string;
  bidder: Bidder;
  item: number;
  auction: number;
}

const VisualizeAuctionScreen = ({ route, navigation }: Props) => {
  const { auction } = route.params;
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFinished: boolean;
    hasStarted: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
    hasStarted: false,
  });
  const [paymentCreated, setPaymentCreated] = useState(false);
  const paymentProcessedRef = useRef(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedBidder, setSelectedBidder] = useState<number | null>(null);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [editBidAmount, setEditBidAmount] = useState("");
  const [isUpdatingBid, setIsUpdatingBid] = useState(false);

  const fetchAuctionDetails = async () => {
    try {
      setAuctionDetails(null);

      const addresses: Address[] = [];
      if (Array.isArray(auction.address)) {
        for (const addressId of auction.address) {
          try {
            const addressResponse = await fetch(
              `http://127.0.0.1:8000/endereco/${addressId}/`
            );
            if (addressResponse.ok) {
              const addressData = await addressResponse.json();
              addresses.push(addressData);
            } else {
              console.error(
                `Erro ao buscar endereço ${addressId}:`,
                addressResponse.status
              );
            }
          } catch (error) {
            console.error(`Erro ao buscar endereço ${addressId}:`, error);
          }
        }
      } else if (typeof auction.address === "number") {
        try {
          const addressResponse = await fetch(
            `http://127.0.0.1:8000/endereco/${auction.address}/`
          );
          if (addressResponse.ok) {
            const addressData = await addressResponse.json();
            addresses.push(addressData);
          }
        } catch (error) {
          console.error("Erro ao buscar endereço:", error);
        }
      }

      const auctioneerResponse = await fetch(
        `http://127.0.0.1:8000/leiloeiro/${auction.auctioneer}/`
      );
      const auctioneer = await auctioneerResponse.json();

      let itemDetails = null;
      if (auction.item) {
        try {
          const itemId =
            typeof auction.item === "object" ? auction.item.id : auction.item;

          const itemResponse = await fetch(
            `http://127.0.0.1:8000/item/${itemId}/`
          );

          if (itemResponse.ok) {
            itemDetails = await itemResponse.json();

            if (
              itemDetails &&
              itemDetails.category &&
              typeof itemDetails.category === "number"
            ) {
              try {
                const categoryResponse = await fetch(
                  `http://127.0.0.1:8000/categoria/${itemDetails.category}/`
                );

                if (categoryResponse.ok) {
                  const categoryDetails = await categoryResponse.json();
                  itemDetails.category = categoryDetails;
                }
              } catch (categoryError) {
                console.error(
                  "Erro ao buscar detalhes da categoria:",
                  categoryError
                );
              }
            }
          } else {
            itemDetails = auction.item;
          }
        } catch (itemError) {
          console.error("Erro ao buscar detalhes do item:", itemError);
          itemDetails = auction.item;
        }
      }

      const finalAuctionDetails = {
        ...auction,
        address: addresses,
        auctioneer,
        item: itemDetails,
        start_date: new Date(auction.start_date),
        end_date: new Date(auction.end_date),
      };

      setAuctionDetails(finalAuctionDetails);
    } catch (error) {
      console.error("Erro ao carregar detalhes do leilão:", error);
    }
  };

  const fetchBidders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/ofertante/");
      const biddersData = await response.json();
      setBidders(biddersData);
    } catch (error) {
      console.error("Erro ao carregar ofertantes:", error);
    }
  };

  const fetchBids = async () => {
    if (!auctionDetails?.id) return;

    setLoadingBids(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/lance/");

      if (response.ok) {
        const allBids = await response.json();

        const auctionBids = allBids.filter((bid: any) => {
          return bid.auction === auctionDetails.id;
        });

        const bidsWithBidderDetails = await Promise.all(
          auctionBids.map(async (bid: any) => {
            try {
              if (typeof bid.bidder === "number") {
                const bidderResponse = await fetch(
                  `http://127.0.0.1:8000/ofertante/${bid.bidder}/`
                );
                if (bidderResponse.ok) {
                  const bidderDetails = await bidderResponse.json();
                  return {
                    ...bid,
                    bidder: bidderDetails,
                  };
                }
              }
              return bid;
            } catch (error) {
              console.error(
                `Erro ao buscar detalhes do ofertante ${bid.bidder}:`,
                error
              );
              return {
                ...bid,
                bidder:
                  typeof bid.bidder === "number"
                    ? { id: bid.bidder, name: `Ofertante ${bid.bidder}` }
                    : bid.bidder,
              };
            }
          })
        );

        const sortedBids = bidsWithBidderDetails.sort(
          (a: Bid, b: Bid) =>
            new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
        );

        setBids(sortedBids);
      } else {
        console.error(
          "Erro na resposta:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Erro ao carregar lances:", error);
    } finally {
      setLoadingBids(false);
    }
  };

  const createPayment = async (winningBid: Bid) => {
    if (!auctionDetails?.item || paymentProcessedRef.current === true) {
      return;
    }

    try {
      const paymentData = {
        amount_paid: winningBid.amount.toString(),
        bidder: winningBid.bidder.id,
        auction: auctionDetails.id,
        item: auctionDetails.item.id,
      };

      const paymentResponse = await fetch("http://127.0.0.1:8000/pagamento/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (paymentResponse.ok) {
        const paymentResult = await paymentResponse.json();
        setPaymentCreated(true);
        Alert.alert(
          "Leilão Finalizado",
          `Leilão finalizado! Pagamento criado automaticamente para o lance vencedor de ${formatCurrency(
            winningBid.amount
          )} do ofertante ${winningBid.bidder.name}.`
        );
      } else {
        const errorData = await paymentResponse.json();
        console.error("Erro ao criar pagamento:", errorData);
        Alert.alert(
          "Aviso",
          "Leilão finalizado, mas houve erro ao criar o pagamento automático."
        );
        paymentProcessedRef.current = false;
      }
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      Alert.alert(
        "Aviso",
        "Leilão finalizado, mas houve erro ao criar o pagamento automático."
      );
      paymentProcessedRef.current = false;
    }
  };

  const calculateTimeLeft = () => {
    if (!auctionDetails) return;

    const now = new Date().getTime();
    const startTime = auctionDetails.start_date.getTime();
    const endTime = auctionDetails.end_date.getTime();

    if (now < startTime) {
      const difference = startTime - now;
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isFinished: false,
        hasStarted: false,
      });
      return;
    }
    if (now > endTime) {
      const newTimeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isFinished: true,
        hasStarted: true,
      };
      setTimeLeft(newTimeLeft);

      if (!timeLeft.isFinished && bids.length > 0 && !paymentCreated) {
        const winningBid = bids[0];
        createPayment(winningBid);
      }
      return;
    }
    const difference = endTime - now;
    setTimeLeft({
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isFinished: false,
      hasStarted: true,
    });
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || !selectedBidder || !auctionDetails?.item) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    const amount = parseFloat(
      bidAmount.replace(/[^\d,]/g, "").replace(",", ".")
    );
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido");
      return;
    }

    setIsSubmittingBid(true);

    try {
      const bidData = {
        amount: amount,
        date_time: new Date().toISOString(),
        bidder: selectedBidder,
        item: auctionDetails.item.id,
        auction: auctionDetails.id,
      };

      const bidResponse = await fetch("http://127.0.0.1:8000/lance/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bidData),
      });

      if (!bidResponse.ok) {
        const errorData = await bidResponse.json();
        Alert.alert("Erro", errorData.message || "Erro ao enviar lance");
        return;
      }

      const itemUpdateData = {
        final_value: amount,
      };

      const itemUpdateResponse = await fetch(
        `http://127.0.0.1:8000/item/${auctionDetails.item.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemUpdateData),
        }
      );

      if (!itemUpdateResponse.ok) {
        console.error(
          "Erro ao atualizar final_value do item:",
          itemUpdateResponse.status
        );
      }

      Alert.alert("Sucesso", "Lance enviado com sucesso!");
      setModalVisible(false);
      setBidAmount("");
      setSelectedBidder(null);

      fetchBids();
      fetchAuctionDetails();
    } catch (error) {
      console.error("Erro ao enviar lance:", error);
      Alert.alert("Erro", "Erro ao enviar lance. Tente novamente.");
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleEditBid = (bid: Bid) => {
    setEditingBid(bid);
    setEditBidAmount(formatCurrency(bid.amount));
    setEditModalVisible(true);
  };

  const handleUpdateBid = async () => {
    if (!editingBid || !editBidAmount || !auctionDetails?.item) {
      Alert.alert("Erro", "Por favor, insira um valor válido");
      return;
    }

    const amount = parseFloat(
      editBidAmount.replace(/[^\d,]/g, "").replace(",", ".")
    );
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido");
      return;
    }

    setIsUpdatingBid(true);

    try {
      const bidUpdateResponse = await fetch(
        `http://127.0.0.1:8000/lance/${editingBid.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount,
          }),
        }
      );

      if (!bidUpdateResponse.ok) {
        const errorData = await bidUpdateResponse.json();
        Alert.alert("Erro", errorData.message || "Erro ao atualizar lance");
        return;
      }
      const isHighestBid =
        bids.length === 0 ||
        bids.every((bid) => bid.id === editingBid.id || amount >= bid.amount);

      if (isHighestBid) {
        const itemUpdateData = {
          final_value: amount,
        };

        const itemUpdateResponse = await fetch(
          `http://127.0.0.1:8000/item/${auctionDetails.item.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemUpdateData),
          }
        );

        if (!itemUpdateResponse.ok) {
          console.error(
            "Erro ao atualizar final_value do item:",
            itemUpdateResponse.status
          );
        }
      }

      Alert.alert("Sucesso", "Lance atualizado com sucesso!");
      setEditModalVisible(false);
      setEditingBid(null);
      setEditBidAmount("");
      fetchBids();
      fetchAuctionDetails();
    } catch (error) {
      console.error("Erro ao atualizar lance:", error);
      Alert.alert("Erro", "Erro ao atualizar lance. Tente novamente.");
    } finally {
      setIsUpdatingBid(false);
    }
  };

  const handleDeleteBid = (bid: Bid) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este lance?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const deleteResponse = await fetch(
                `http://127.0.0.1:8000/lance/${bid.id}/`,
                {
                  method: "DELETE",
                }
              );

              if (!deleteResponse.ok) {
                Alert.alert("Erro", "Erro ao excluir lance");
                return;
              }
              const remainingBids = bids.filter((b) => b.id !== bid.id);

              let newFinalValue;
              if (remainingBids.length > 0) {
                newFinalValue = Math.max(...remainingBids.map((b) => b.amount));
              } else {
                newFinalValue = auctionDetails?.item?.starting_value || 0;
              }
              if (auctionDetails?.item) {
                const itemUpdateData = {
                  final_value: newFinalValue,
                };

                const itemUpdateResponse = await fetch(
                  `http://127.0.0.1:8000/item/${auctionDetails.item.id}/`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(itemUpdateData),
                  }
                );

                if (!itemUpdateResponse.ok) {
                  console.error(
                    "Erro ao atualizar final_value do item:",
                    itemUpdateResponse.status
                  );
                }
              }

              Alert.alert("Sucesso", "Lance excluído com sucesso!");

              fetchBids();
              fetchAuctionDetails();
            } catch (error) {
              console.error("Erro ao excluir lance:", error);
              Alert.alert("Erro", "Erro ao excluir lance. Tente novamente.");
            }
          },
        },
      ]
    );
  };

  const isLatestBid = (bidIndex: number) => {
    return bidIndex === 0;
  };

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    const formattedValue = (parseInt(numericValue) / 100).toFixed(2);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(formattedValue));
  };

  useEffect(() => {
    fetchAuctionDetails();
    fetchBidders();
  }, [auction.id]);

  useEffect(() => {
    if (auctionDetails) {
      calculateTimeLeft();
      fetchBids();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [auctionDetails]);

  useEffect(() => {
    if (
      timeLeft.isFinished &&
      !paymentProcessedRef.current &&
      bids.length > 0 &&
      auctionDetails?.id
    ) {
      paymentProcessedRef.current = true;
      const winningBid = bids[0];
      createPayment(winningBid);
    }
  }, [timeLeft.isFinished, auctionDetails?.id]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!auctionDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.statusContainer,
            timeLeft.isFinished
              ? styles.statusFinished
              : !timeLeft.hasStarted
              ? styles.statusNotStarted
              : styles.statusActive,
          ]}
        >
          <Ionicons
            name={
              timeLeft.isFinished
                ? "checkmark-circle"
                : !timeLeft.hasStarted
                ? "time-outline"
                : "flash"
            }
            size={24}
            color="#fff"
          />
          <Text style={styles.statusText}>
            {timeLeft.isFinished
              ? "LEILÃO FINALIZADO"
              : !timeLeft.hasStarted
              ? "LEILÃO AINDA NÃO INICIADO"
              : "LEILÃO EM ANDAMENTO"}
          </Text>
        </View>

        {!timeLeft.isFinished && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerTitle}>
              {!timeLeft.hasStarted ? "Tempo para início:" : "Tempo restante:"}
            </Text>
            <View style={styles.timerDisplay}>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeLeft.days}</Text>
                <Text style={styles.timerLabel}>Dias</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeLeft.hours}</Text>
                <Text style={styles.timerLabel}>Horas</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeLeft.minutes}</Text>
                <Text style={styles.timerLabel}>Min</Text>
              </View>
              <Text style={styles.timerSeparator}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeLeft.seconds}</Text>
                <Text style={styles.timerLabel}>Seg</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações do Leilão</Text>

          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={20} color="#4B7BE5" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Título</Text>
              <Text style={styles.infoValue}>{auctionDetails.title}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="reader-outline" size={20} color="#4B7BE5" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Descrição</Text>
              <Text style={styles.infoValue}>{auctionDetails.description}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#4B7BE5" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data de Início</Text>
              <Text style={styles.infoValue}>
                {formatDate(auctionDetails.start_date)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#4B7BE5" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data de Término</Text>
              <Text style={styles.infoValue}>
                {formatDate(auctionDetails.end_date)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {auctionDetails.address.length > 1 ? "Endereços" : "Localização"}
          </Text>
          {auctionDetails.address.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Nenhum endereço disponível</Text>
            </View>
          ) : (
            auctionDetails.address.map((address, index) => (
              <View
                key={address.id || index}
                style={[
                  styles.addressContainer,
                  index > 0 && styles.additionalAddress,
                ]}
              >
                {auctionDetails.address.length > 1 && (
                  <Text style={styles.addressIndex}>Endereço {index + 1}</Text>
                )}
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#4B7BE5" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Endereço</Text>
                    <Text style={styles.infoValue}>
                      {`${address.street}, ${address.number}`}
                    </Text>
                    <Text style={styles.infoValue}>
                      {`${address.city} - ${address.state}`}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {auctionDetails.item && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Item em Leilão</Text>

            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={20} color="#4B7BE5" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nome do Item</Text>
                <Text style={styles.infoValue}>{auctionDetails.item.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="list-outline" size={20} color="#4B7BE5" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Categoria</Text>
                <Text style={styles.infoValue}>
                  {typeof auctionDetails.item.category === "string"
                    ? auctionDetails.item.category
                    : auctionDetails.item.category?.name ||
                      "Categoria não informada"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="document-outline" size={20} color="#4B7BE5" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Descrição do Item</Text>
                <Text style={styles.infoValue}>
                  {auctionDetails.item.description}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#4B7BE5" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Valor Inicial</Text>
                <Text style={[styles.infoValue, styles.priceValue]}>
                  {formatCurrency(auctionDetails.item.starting_value)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Valor Atual</Text>
                <Text style={[styles.infoValue, styles.currentPriceValue]}>
                  {auctionDetails.item.final_value
                    ? formatCurrency(auctionDetails.item.final_value)
                    : formatCurrency(auctionDetails.item.starting_value)}
                </Text>
              </View>
            </View>

            {timeLeft.hasStarted && !timeLeft.isFinished && (
              <TouchableOpacity
                style={styles.bidButton}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="hammer-outline" size={20} color="#fff" />
                <Text style={styles.bidButtonText}>Dar Lance</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Lances</Text>
            <TouchableOpacity onPress={fetchBids} style={styles.refreshButton}>
              <Ionicons name="refresh-outline" size={20} color="#4B7BE5" />
            </TouchableOpacity>
          </View>
          {loadingBids ? (
            <Text style={styles.loadingText}>Carregando lances...</Text>
          ) : bids.length === 0 ? (
            <View style={styles.emptyBidsContainer}>
              <Ionicons name="hammer-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyBidsText}>Nenhum lance realizado</Text>
            </View>
          ) : (
            <View style={styles.bidsContainer}>
              {bids.map((bid, index) => (
                <View
                  key={bid.id}
                  style={[
                    styles.bidCard,
                    isLatestBid(index) && styles.latestBidCard,
                  ]}
                >
                  <View style={styles.bidHeader}>
                    <View style={styles.bidInfo}>
                      <Text style={styles.bidderName}>{bid.bidder.name}</Text>
                      {isLatestBid(index) && (
                        <View style={styles.latestBadge}>
                          <Text style={styles.latestBadgeText}>
                            {timeLeft.isFinished
                              ? "Lance Vencedor"
                              : "Último Lance"}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.bidAmount,
                        isLatestBid(index) && styles.latestBidAmount,
                      ]}
                    >
                      {formatCurrency(bid.amount)}
                    </Text>
                  </View>
                  <Text style={styles.bidDateTime}>
                    {formatDateTime(bid.date_time)}
                  </Text>

                  {isLatestBid(index) && timeLeft.isFinished && (
                    <TouchableOpacity
                      style={styles.paymentButton}
                      onPress={() => navigation.navigate("Payments")}
                    >
                      <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.paymentButtonText}>
                        Ir para Pagamento
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isLatestBid(index) &&
                    timeLeft.hasStarted &&
                    !timeLeft.isFinished && (
                      <View style={styles.bidActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditBid(bid)}
                        >
                          <Ionicons
                            name="create-outline"
                            size={16}
                            color="#4B7BE5"
                          />
                          <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteBid(bid)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#EF4444"
                          />
                          <Text style={styles.deleteButtonText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dar Lance</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Valor do Lance</Text>
              <TextInput
                style={styles.textInput}
                value={bidAmount}
                onChangeText={(text) => {
                  const formatted = formatCurrencyInput(text);
                  setBidAmount(formatted);
                }}
                placeholder="R$ 0,00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ofertante</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedBidder}
                  onValueChange={(itemValue) => setSelectedBidder(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um ofertante" value={null} />
                  {bidders.map((bidder) => (
                    <Picker.Item
                      key={bidder.id}
                      label={bidder.name}
                      value={bidder.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmitBid}
                disabled={isSubmittingBid}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmittingBid ? "Enviando..." : "Enviar Lance"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Lance</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Novo Valor do Lance</Text>
              <TextInput
                style={styles.textInput}
                value={editBidAmount}
                onChangeText={(text) => {
                  const formatted = formatCurrencyInput(text);
                  setEditBidAmount(formatted);
                }}
                placeholder="R$ 0,00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleUpdateBid}
                disabled={isUpdatingBid}
              >
                <Text style={styles.submitButtonText}>
                  {isUpdatingBid ? "Atualizando..." : "Atualizar Lance"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusActive: {
    backgroundColor: "#10B981",
  },
  statusFinished: {
    backgroundColor: "#6B7280",
  },
  statusNotStarted: {
    backgroundColor: "#F59E0B",
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  timerContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  timerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerBlock: {
    alignItems: "center",
    backgroundColor: "#4B7BE5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
  },
  timerNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  timerLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  timerSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4B7BE5",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  bidButton: {
    backgroundColor: "#4B7BE5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  bidButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bidsContainer: {
    gap: 12,
  },
  bidCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  latestBidCard: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
    borderWidth: 2,
  },
  bidHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bidInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bidderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  latestBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  latestBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  latestBidAmount: {
    fontSize: 18,
    color: "#F59E0B",
  },
  bidDateTime: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  bidActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
  },
  noDataContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  addressContainer: {
    marginBottom: 12,
  },
  additionalAddress: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addressIndex: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B7BE5",
    marginBottom: 8,
  },
  editButtonText: {
    color: "#4B7BE5",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyBidsContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyBidsText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4B7BE5",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  currentPriceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  priceIncrease: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginTop: 2,
  },
  paymentButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  paymentButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default VisualizeAuctionScreen;
