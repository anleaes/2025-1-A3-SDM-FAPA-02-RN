import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import CustomDrawerContent from "../components/CustomDrawerContent";
import CategoriesScreen, { Category } from "@/screens/CategoriesScreen";
import ItemsScreen, { Item } from "@/screens/ItemsScreen";
import AddressScreen, { Address } from "@/screens/AddressScreen";
import AuctioneersScreen, { Auctioneer } from "@/screens/AuctioneersScreen";
import AuctionsScreen, { Auction } from "@/screens/AuctionsScreen";
import CreateAuctionScreen from "@/screens/CreateAuctionScreen";
import EditAuctionScreen from "@/screens/EditAuctionScreen";
import BiddersScreen, { Bidder } from "@/screens/BiddersScreen";
import CreateBidderScreen from "@/screens/CreateBidderScreen";
import EditBidderScreen from "@/screens/EditBidderScreen";
import CreateAuctioneerScreen from "@/screens/CreateAuctioneerScreen";
import EditAuctioneerScreen from "@/screens/EditAuctioneerScreen";
import CreateAddressScreen from "@/screens/CreateAddressScreen";
import EditAddressScreen from "@/screens/EditAddressScreen";
import CreateCategoryScreen from "@/screens/CreateCategoryScreen";
import EditCategoryScreen from "@/screens/EditCategoryScreen";
import EditItemScreen from "@/screens/EditItemScreen";
import CreateItemScreen from "@/screens/CreateItemScreen";
import VisualizeAuctionScreen from "@/screens/VisualizeAuctionScreen";
import HomeScreen from "@/screens/HomeScreen";

export type DrawerParamList = {
  Home: undefined;
  Categories: undefined;
  CreateCategory: undefined;
  EditCategory: { category: Category };
  Items: undefined;
  CreateItem: undefined;
  EditItem: { item: Item };
  Address: undefined;
  CreateAddress: undefined;
  EditAddress: { address: Address };
  Auctioneers: undefined;
  CreateAuctioneer: undefined;
  EditAuctioneer: { bidder: Auctioneer };
  Bidders: undefined;
  CreateBidder: undefined;
  EditBidder: { bidder: Bidder };
  Auctions: undefined;
  CreateAuction: undefined;
  EditAuction: { auction: Auction };
  VisualizeAuction: { auction: Auction };
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: "#4B7BE5",
        drawerLabelStyle: { marginLeft: 0, fontSize: 16 },
        drawerStyle: { backgroundColor: "#fff" },
        headerStyle: { backgroundColor: "#4B7BE5" },
        headerTintColor: "#fff",
        drawerType: "slide",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          title: "Início",
        }}
      />
      <Drawer.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
          title: "Categorias",
        }}
      />
      <Drawer.Screen
        name="CreateCategory"
        component={CreateCategoryScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Nova categoria",
        }}
      />
      <Drawer.Screen
        name="EditCategory"
        component={EditCategoryScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Editar categoria",
        }}
      />

      <Drawer.Screen
        name="Items"
        component={ItemsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="pricetag-outline" size={size} color={color} />
          ),
          title: "Itens",
        }}
      />
      <Drawer.Screen
        name="CreateItem"
        component={CreateItemScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Novo item",
        }}
      />
      <Drawer.Screen
        name="EditItem"
        component={EditItemScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Editar item",
        }}
      />

      <Drawer.Screen
        name="Address"
        component={AddressScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
          title: "Endereços",
        }}
      />
      <Drawer.Screen
        name="CreateAddress"
        component={CreateAddressScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Novo endereço",
        }}
      />
      <Drawer.Screen
        name="EditAddress"
        component={EditAddressScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Editar endereço",
        }}
      />

      <Drawer.Screen
        name="Auctioneers"
        component={AuctioneersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          title: "Leiloeiros",
        }}
      />
      <Drawer.Screen
        name="CreateAuctioneer"
        component={CreateAuctioneerScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Novo leiloeiro",
        }}
      />
      <Drawer.Screen
        name="EditAuctioneer"
        component={EditAuctioneerScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Editar leiloeiro",
        }}
      />

      <Drawer.Screen
        name="Bidders"
        component={BiddersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          title: "Ofertantes",
        }}
      />
      <Drawer.Screen
        name="CreateBidder"
        component={CreateBidderScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Novo ofertante",
        }}
      />
      <Drawer.Screen
        name="EditBidder"
        component={EditBidderScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Editar ofertante",
        }}
      />

      <Drawer.Screen
        name="Auctions"
        component={AuctionsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
          title: "Leilões",
        }}
      />
      <Drawer.Screen
        name="CreateAuction"
        component={CreateAuctionScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Novo leilão",
        }}
      />
      <Drawer.Screen
        name="EditAuction"
        component={EditAuctionScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Editar leilão",
        }}
      />
      <Drawer.Screen
        name="VisualizeAuction"
        component={VisualizeAuctionScreen}
        options={{
          drawerItemStyle: { display: "none" },
          title: "Visualizar leilão",
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
