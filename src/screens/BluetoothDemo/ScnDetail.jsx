import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View,
  NativeModules, NativeEventEmitter,
} from "react-native";
import resolversForPeripherals from "./resolversForPeripherals.mjs";
import _ from "lodash";
import ui from "@/styles/ui.css.js";
import styles from "./styles.css.js";
import * as utils from '@/libs/utils.mjs';
import cacheLogger from '@/libs/cacheLogger.mjs';

import Drawer from "../../components/Drawer/Drawer";
import ListItem from "./components/ListItem";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const ScnDetail = (props) => {
  const { navigation, route } = props;
  const { peripheralId } = route.params;

  const peripheralDefault = {
    id: peripheralId,
    connected: false,
    isConnecting: false,
    advertising: { isConnectable: false },
  };
  const [peripheral, setPeripheral] = useState(props.peripherals.get(peripheralId) ?? peripheralDefault);
  const [resolversForPeripheral, setResolversForPeripheral] = useState(null);

  useEffect(() => {
    const peripheral = props.peripherals.get(peripheralId) ?? peripheralDefault;
    setPeripheral(peripheral);
    const resolversForPeripheral = resolversForPeripherals.find(r4p => r4p._finder(peripheral)) ?? null;
    setResolversForPeripheral(resolversForPeripheral);
  }, [props.peripherals]);

  const [rssi, setRssi] = useState("");
  const [isConnected, setIsConnected] = useState(peripheral.connected);
  const [peripheralInfo, setPeripheralInfo] = useState(null);

  const [logsForPeripheral, setLogsForPeripheral] = useState(props.logsForPeripherals.get(peripheral.id) ?? []);
  const pushLog = (message) => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19);
    setLogsForPeripheral((prevLog) => {
      if (prevLog.length > 20) {
        prevLog.shift();
      }
      return [...prevLog, `[${timestamp}] ${message}`];
    });
  };
  useEffect(() => {
    props.addOrUpdateLogsForPeripheral(peripheral.id, logsForPeripheral);
  }, [logsForPeripheral]);
  useFocusEffect(
    React.useCallback(() => {
      pushLog("進入詳情頁, 開始記錄日誌...");
      return () => {
        pushLog("离开詳情頁, 停止記錄日誌");
      };
    }, []),
  );

  useEffect(() => {
    // 更新連接狀態
    if (peripheral.connected !== isConnected) {
      setIsConnected(peripheral.connected);
      pushLog(`連接狀態變更：${peripheral.connected ? "已連接" : "未連接"}`);
    }

    // 更新 info
    if (peripheral.connected === true) {
      props.sleep()
        .then(() => {
          props.BleManager.retrieveServices(peripheral.id)
            .then(info => {
              cacheLogger.debug("[retrieveServices] success:", info);
              setPeripheralInfo(info);
            })
            .catch(error => {
              cacheLogger.debug("[retrieveServices] failed:", error);
            });
        });
    }

    // 更新 rssi
    let intervalId = undefined;
    if (peripheral.connected === true) {
      function updateRSSI() {
        props.BleManager.readRSSI(peripheral.id)
          .then((rssi) => {
            setRssi(rssi);
          })
          .catch(error => {
            setRssi("");
          });
      }

      updateRSSI();
      intervalId = setInterval(updateRSSI, 1000);
    } else {
      setRssi("");
    }

    const listeners = [
      bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic", (data) => {
        const { value, peripheral, characteristic, service } = data;
        const valueInHex = utils.transArrFromDecToHex(value);
        data.valueInHex = valueInHex;
        data.valueLength = value.length;
        const serviceAbbr = utils.isStandardBLEUUID(service) ? service.slice(4, 8) : service;
        const characteristicAbbr = utils.isStandardBLEUUID(characteristic) ? characteristic.slice(4, 8) : characteristic;

        // 解析測量值
        let resolvedMsg = "";
        let title = "";
        if (resolversForPeripheral) {
          for (const item of resolversForPeripheral.characteristics) {
            if (item.service === serviceAbbr.toLowerCase() && item.characteristic === characteristicAbbr.toLowerCase()) {
              // 獲取解析後的測量值
              resolvedMsg = item._resolver(value).message;
              title = item._title;
              break;
            }
          }
        }

        // 更新 log
        let msg = `收到消息 <${utils.getHeadAndTail(serviceAbbr, 8, 4)}> <${utils.getHeadAndTail(characteristicAbbr, 8, 4)}> [${value}] [${valueInHex}]`;
        msg = resolvedMsg ? `${msg} | <${title}> ${resolvedMsg}` : msg;
        pushLog(msg);
        cacheLogger.debug(`[UpdateValueForCharacteristic] ${characteristic}`, data);
      }),
      bleManagerEmitter.addListener("BleManagerDidUpdateState", (args) => {
        cacheLogger.log(`[BleManagerDidUpdateState]`, args);
      }),
    ];
    if (peripheral.connecting === true) {
      pushLog("正在連接...");
    }

    return () => {
      if (typeof intervalId === "number") {
        clearInterval(intervalId);
      }
      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, [peripheral]);

  const [subscribedItems, setSubscribedItems] = useState([]);

  useEffect(() => {
    // 更新訂閱項目
    if (peripheralInfo) {
      setSubscribedItems(
        peripheralInfo.characteristics
          // 篩選出可訂閱的特徵
          .filter(c => c.properties?.Notify || c.properties.Indicate)
          // 將特徵按照是否已知來分類
          .map((c, i) => {
            const knownInfo = resolversForPeripheral?.characteristics
              .find(knownC => c.characteristic.toLowerCase() === knownC.characteristic && c.service.toLowerCase() === knownC.service);
            const newInfo = _.clone(c);
            newInfo.isKnown = !!knownInfo;
            newInfo.title = knownInfo?._title ?? "未知特徴";
            return newInfo;
          })
          // 按照是否已知來排序
          .sort(c => c.isKnown ? -1 : 1),
      );
    } else {
      setSubscribedItems([]);
    }

    // 開始訂閱
    if (peripheral.connected === true && peripheralInfo) {
      for (const c of peripheralInfo.characteristics) {
        if (c.properties?.Notify === "Notify" || c.properties?.Indicate === "Indicate") {
          props.BleManager.startNotification(peripheral.id, c.service, c.characteristic)
            .then(() => {
              cacheLogger.debug("[startNotification] success:", peripheral.id, c.service, c.characteristic);
            })
            .catch((error) => {
              cacheLogger.debug("[startNotification] error:", error);
            });
        }
      }
    }

    return () => {
      if (peripheralInfo) {
        for (const c of peripheralInfo.characteristics) {
          if (c.properties?.Notify === "Notify" || c.properties?.Indicate === "Indicate") {
            props.BleManager.stopNotification(peripheral.id, c.service, c.characteristic)
              .then(() => {
                cacheLogger.debug("[stopNotification] success:", peripheral.id, c.service, c.characteristic);
              })
              .catch((error) => {
                cacheLogger.debug("[stopNotification] error:", error);
              });
          }
        }
      }
    };
  }, [peripheralInfo]);

  return (
    <SafeAreaView style={styles.main}>
      {!peripheral ? (
        <View style={styles.contentEmpty}><Text>未發現設備</Text></View>
      ) : (
        <>
          <View style={styles.deviceList}>
            <ListItem {...props} peripheral={peripheral} disableNavigate={true} rssi={rssi} />
          </View>

          <ScrollView style={styles.contentList} scrollEnabled={true}>
            <Drawer title="設備信息" expanded={false}>
              <Text>{peripheralInfo ? JSON.stringify(peripheralInfo, (key, value) => value, 4) : "連接設備以查看"}</Text>
            </Drawer>
            <Drawer title="訂閱特徴" expanded={true}>
              {peripheral.connected && peripheralInfo ? (
                subscribedItems.map((info, i) => {
                  const service = utils.getHeadAndTail(info.service, 8, 4);
                  const characteristic = utils.getHeadAndTail(info.characteristic, 8, 4);
                  return (
                    <View key={`${info.service}_${info.characteristic}`} style={{
                      marginBottom: 5,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}>
                      <Text style={{ opacity: info.isKnown ? 1 : 0.5 }}>{info.title}</Text>
                      <Text style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}>{`<${service}><${characteristic}>`}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={{ textAlign: "left" }}>無訂閱特徴</Text>
              )}
            </Drawer>
            <Drawer title="歷史日誌" expanded={true}>
              {logsForPeripheral.length > 0 ? (
                logsForPeripheral
                  .map((msg, i) => <Text style={{ marginBottom: 5 }} key={i}># {msg}</Text>)
                  .reverse()
              ) : (
                <Text>無歷史日誌</Text>
              )}
            </Drawer>
            <View style={{ height: 100 }}>{/* 為了填充 ScrollView 的高度而存在 */}</View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default ScnDetail;
