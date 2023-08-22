import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Pressable } from "react-native";

import ui from "@/styles/ui.css.js";

export default (props) => {
  const { peripheral, navigation, disableNavigate = false } = props;
  const { rssi = peripheral.rssi } = props;
  return (
    <TouchableOpacity
      style={{
        ...styles.deviceItemContainer,
        opacity: peripheral.advertising.isConnectable === false ? 0.5 : 1,
      }}
      onPress={() => {
        if (disableNavigate) return;
        navigation.navigate("Detail", { peripheralId: peripheral.id })
      }}
      disabled={peripheral.advertising.isConnectable === false || disableNavigate}
    >
      <View style={styles.deviceItemTextContainer}>
        <Text style={styles.deviceItemName}>
          {/* completeLocalName (item.name) & shortAdvertisingName (advertising.localName) may not always be the same */}
          {/*{peripheral.name} - {peripheral?.advertising?.localName}*/}
          {peripheral.name ?? "-"}
        </Text>
        <Text style={styles.deviceItemRssi}>RSSI: { rssi }</Text>
        <Text style={styles.deviceItemId}>{peripheral.id}</Text>
      </View>
      <Pressable style={styles.deviceItemButtonContainer} onPress={(e) => e.stopPropagation()}>
        {peripheral.advertising.isConnectable === false ? (
          <TouchableOpacity style={{ ...styles.deviceItemButton }} disabled>
            <Text style={styles.deviceItemButtonText}>不可連接</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={{
                ...styles.deviceItemButton,
                backgroundColor: peripheral.connecting ? "#c93" : (peripheral.connected ? "#693" : "#555"),
                opacity: peripheral.connecting ? 0.5 : 1,
              }}
              onPressOut={() => props.togglePeripheralConnection(peripheral)}
              disabled={peripheral.connecting}
            >
              {peripheral.connected ? (
                <Text style={styles.deviceItemButtonText}>已連接</Text>
              ) : (
                <Text style={styles.deviceItemButtonText}>
                  {peripheral.connecting ? "連接中" : "可連接"}
                </Text>
              )}
            </TouchableOpacity>
            {/*<TouchableOpacity*/}
            {/*  style={{*/}
            {/*    ...styles.deviceItemButton,*/}
            {/*    backgroundColor: peripheral.bonded ? "#693" : "#555",*/}
            {/*  }}*/}
            {/*  onPressOut={() => props.togglePeripheralBonding(peripheral.id)}*/}
            {/*>*/}
            {/*  <Text style={styles.deviceItemButtonText}>綁定</Text>*/}
            {/*</TouchableOpacity>*/}
            {/*<View style={[ui.switchContainer]}>*/}
            {/*  <Text style={ui.switchText}>自動重連</Text>*/}
            {/*  <Switch*/}
            {/*    onValueChange={() => props.toggleAutoReconnect(peripheral)}*/}
            {/*    value={peripheral.autoReconnect}*/}
            {/*  />*/}
            {/*</View>*/}
          </>
        )}
      </Pressable>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceItemContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 0,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceItemTextContainer: {
    flex: 1,
    marginRight: 10,
    margin: 0,
    padding: 0,
  },
  deviceItemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deviceItemStatus: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  deviceItemRssi: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  deviceItemId: {
    fontSize: 14,
    color: "#666",
  },
  deviceItemButtonContainer: {
    flexDirection: "column",
    gap: 10,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    height: '100%',
  },
  deviceItemButton: {
    height: 40,
    width: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#555",
  },
  deviceItemButtonText: {
    color: "#FFF",
    fontSize: 14,
  },
});

