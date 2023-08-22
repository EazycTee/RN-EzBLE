import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

// 定义一个抽屉组件，点击标题可以展开或收起内容
const Drawer = ({ title, expanded: expendedDefault = false, children }) => {
  const [expanded, setExpanded] = React.useState(expendedDefault);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.titleBar}
        onPressOut={() => setExpanded(!expanded)}
      >
        <Text>{(expanded ? "▼ " : "▶ ") + title}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  titleBar: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  content: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
  },
});

export default Drawer;
