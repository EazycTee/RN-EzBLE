import React, { useState, useEffect, useMemo, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Pressable,
} from "react-native";

import ListItem from "./components/ListItem";
import ui from "@/styles/ui.css.js";
import styles from "./styles.css";

const ScnList = (props) => {
  const { navigation } = props;

  const sortedPeripherals = useMemo(() => {
    return Array.from(props.peripherals.values())
      // .sort((a, b) => { // sort by name
      //   if (a.name && !b.name) {
      //     return -1;
      //   } else if (!a.name && b.name) {
      //     return 1;
      //   } else {
      //     return 0;
      //   }
      // })
      // .sort((a, b) => { // sort by connectable
      //   if (a.advertising?.isConnectable && !b.advertising?.isConnectable) {
      //     return -1;
      //   } else if (!a.advertising?.isConnectable && b.advertising?.isConnectable) {
      //     return 1;
      //   } else {
      //     return 0;
      //   }
      // });
  }, [props.peripherals]);

  return (
    <>
      <SafeAreaView style={styles.main}>
        <View style={styles.content}>
          {sortedPeripherals.length === 0 ? (
            <View style={styles.contentEmpty}>
              <Text style={{ textAlign: "center", fontSize: 16, color: "#666" }}>未發現藍芽設備</Text>
            </View>
          ) : (
            <FlatList
              style={styles.deviceList}
              data={sortedPeripherals}
              contentContainerStyle={styles.deviceListContainer}
              renderItem={({ item }) => <ListItem {...props} peripheral={item} />}
              keyExtractor={item => item.id}
            />
          )}
          {props.isScanning && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#069400" />
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};
export default ScnList;
