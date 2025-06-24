import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import CustomDrawerContent from "../components/CustomDrawerContent";
import CategoriesScreen, { Category } from "@/screens/CategoriesScreen";
import ItemsScreen, { Item } from "@/screens/ItemsScreen";
import CreateCategoryScreen from "@/screens/CreateCategoryScreen";
import EditCategoryScreen from "@/screens/EditCategoryScreen";
import EditItemScreen from "@/screens/EditItemScreent";
import CreateItemScreen from "@/screens/CreateItemScreen";
import HomeScreen from "@/screens/HomeScreen";

export type DrawerParamList = {
  Home: undefined;
  Categories: undefined;
  CreateCategory: undefined;
  EditCategory: { category: Category };
  Items: undefined;
  CreateItem: undefined;
  EditItem: { item: Item };
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
            <Ionicons name="settings-outline" size={size} color={color} />
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
            <Ionicons name="settings-outline" size={size} color={color} />
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
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
