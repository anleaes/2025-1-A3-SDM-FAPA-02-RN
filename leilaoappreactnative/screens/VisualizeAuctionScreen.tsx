import { DrawerScreenProps } from "@react-navigation/drawer";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { DrawerParamList } from "../navigation/DrawerNavigator";

type Props = DrawerScreenProps<DrawerParamList, "VisualizeAuction">;

const VisualizeAuctionScreen = ({ route, navigation }: Props) => {
  const { auction } = route.params;

  return (
    <ScrollView keyboardShouldPersistTaps="handled">{auction.title}</ScrollView>
  );
};

const styles = StyleSheet.create({});

export default VisualizeAuctionScreen;
