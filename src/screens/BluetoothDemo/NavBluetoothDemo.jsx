import React, { useState, useEffect } from "react";
import {
  NativeModules, NativeEventEmitter,
  StyleSheet,
  StatusBar, View, Text, TouchableOpacity,
} from "react-native";
import { useFlipper } from "@react-navigation/devtools";
import { OrientationLocker, PORTRAIT, LANDSCAPE, UNLOCK } from "react-native-orientation-locker";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import BleManager from "@/libs/BleManager.mjs";
import usePermissions from "@/hooks/usePermissions";

import ScnList from "./ScnList";
import ScnDetail from "./ScnDetail";

const Stack = createStackNavigator();

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const NavBluetoothDemo = (props) => {
  const { requestAndroidPermissions, isPermissionsReady } = usePermissions();

  const navigationRef = useNavigationContainerRef();
  useFlipper(navigationRef);

  const [isScanning, setIsScanning] = useState(false);
  const [isStopping, setIsStopping] = useState(false)

  const [peripherals, setPeripherals] = useState(new Map());
  const addOrUpdatePeripheral = (id, updatedPeripheral) => {
    // new Map() enables changing the reference & refreshing UI.
    setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
  };

  const [logsForPeripherals, setLogsForPeripherals] = useState(new Map());
  const addOrUpdateLogsForPeripheral = (id, updatedLogForPeripheral) => {
    setLogsForPeripherals(map => new Map(map.set(id, updatedLogForPeripheral)));
  };

  const toggleAutoReconnect = (peripheral) => {
    addOrUpdatePeripheral(peripheral.id, { ...peripheral, autoReconnect: !peripheral.autoReconnect });
  };

  const clearList = () => {
    peripherals.clear();
    // insert the ones that are connected.
    BleManager.getConnectedPeripherals([])
      .then(peripherals => {
        for (let peripheral of peripherals) {
          addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: false, connected: true });
        }
      });
  }

  const handleStopScan = () => {
    setIsScanning(false);
    setIsStopping(false);
    // console.debug("[handleStopScan] discovered peripherals:", Array.from(peripherals.values()));
  };

  const handleDisconnectedPeripheral = (event) => {
    const { peripheral: peripheralId } = event;
    const peripheral = peripherals.get(peripheralId);
    if (peripheral) {
      addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: false, connected: false });
      console.debug(`[handleDisconnectedPeripheral][${peripheral.id}] previously connected peripheral is disconnected.`, peripheral);
      if (peripheral.autoReconnect) {
        console.log(`[handleDisconnectedPeripheral][${peripheral.id}] reconnect peripheral in 3 seconds...`);
        setTimeout(() => {
          const peripheral = peripherals.get(peripheralId);
          peripheral.autoReconnect && connectPeripheral(peripheral.id);
        }, 3000);
      }
    }
    console.debug(`[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`);
  };

  const handleUpdateValueForCharacteristic = (data) => {
    console.debug(
      `[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}'`,
    );
  };

  const handleDiscoverPeripheral = (peripheral) => {
    if (!peripheral.name) return;
    if (!peripheral.advertising.isConnectable) return;

    // console.debug("[handleDiscoverPeripheral] new BLE peripheral=", peripheral);
    addOrUpdatePeripheral(peripheral.id, {
      ...peripheral,
      connecting: false,
      connected: false,
      autoReconnect: false,
    });
  };

  const togglePeripheralConnection = (peripheral) => {
    // console.log('togglePeripheralConnection', peripheral)
    if (peripheral && peripheral.connected) {
      BleManager.disconnect(peripheral.id)
        .catch(error => {
          console.error(`[togglePeripheralConnection][${peripheral.id}] error when trying to disconnect device.`, error);
        });
    } else {
      connectPeripheral(peripheral.id);
    }
  };

  const retrieveConnected = async () => {
    try {
      const connectedPeripherals = await BleManager.getConnectedPeripherals();
      if (connectedPeripherals.length === 0) {
        console.warn("[retrieveConnected] No connected peripherals found.");
        return;
      }

      console.debug(
        "[retrieveConnected] connectedPeripherals",
        connectedPeripherals,
      );

      for (let i = 0; i < connectedPeripherals.length; i++) {
        let peripheral = connectedPeripherals[i];
        addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: false, connected: true });
      }
    } catch (error) {
      console.error(
        "[retrieveConnected] unable to retrieve connected peripherals.",
        error,
      );
    }
  };

  const connectPeripheral = (id) => {
    const peripheral = peripherals.get(id);
    if (peripheral && !peripheral.connecting && !peripheral.connected) {
      addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: true, connected: false });
      BleManager.connect(peripheral.id)
        .then(() => {
          console.debug(`[connectPeripheral][${peripheral.id}] connected.`);
          addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: false, connected: true });
        })
        .catch(error => {
          console.error(`[connectPeripheral][${peripheral.id}] connectPeripheral error`, error);
          addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: false, connected: false });
          if (peripheral.autoReconnect) {
            console.debug(`[connectPeripheral][${peripheral.id}] reconnectPeripheral in 3 seconds...`);
            setTimeout(() => {
              connectPeripheral(peripheral.id);
            }, 4000);
          }
        });
    }
  };

  const togglePeripheralBonding = (id) => {
    const peripheral = peripherals.get(id);

    if (peripheral && peripheral.bonded) {
      BleManager.removeBond(id)
        .then(() => {
          console.log("removeBond success");
          addOrUpdatePeripheral(peripheral.id, { ...peripheral, bonded: false });
        })
        .catch(() => {
          console.log("fail to remove the bond");
        });
    } else {
      BleManager.createBond(id)
        .then(() => {
          console.log("createBond success or there is already an existing one");
          if (peripheral) addOrUpdatePeripheral(peripheral.id, { ...peripheral, bonded: true });
        })
        .catch(() => {
          console.log("fail to bond");
        });
    }
  };

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // 初始化
  useEffect(() => {
    // 檢查 Android 權限
    requestAndroidPermissions();

    // 初始化 BleManager
    BleManager.start({ showAlert: false })
      .then(() => console.debug("BleManager started."))
      .catch(error =>
        console.error("BeManager could not be started.", error),
      );

    BleManager.autoScan();

    // 檢查並更新所有設備
    BleManager.getDiscoveredPeripherals([]).then(peripherals => {
      for (let peripheral of peripherals) {
        addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: false, connected: false });
      }
    });

    // 檢查並更新設備的已連接狀態
    BleManager.getConnectedPeripherals([]).then(peripherals => {
      for (let peripheral of peripherals) {
        addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: false, connected: true });
      }
    });

    const listeners = [
      bleManagerEmitter.addListener("BleManagerDiscoverPeripheral", handleDiscoverPeripheral),
    ];

    return () => {
      listeners.forEach(listener => listener.remove());
    };
  }, []);

  useEffect(() => {

    const listeners = [
      bleManagerEmitter.addListener("BleManagerStopScan", handleStopScan),
      bleManagerEmitter.addListener("BleManagerDisconnectPeripheral", handleDisconnectedPeripheral),
      // bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic", handleUpdateValueForCharacteristic),
    ];
    return () => {
      listeners.forEach(listener => listener.remove());
    };
  }, [peripherals]);

  // 把所有變量和方法封裝成一個對象, 用於傳遞給子組件
  const bleUtils = {
    BleManager,
    bleManagerEmitter,
    isScanning,
    peripherals,
    togglePeripheralConnection,
    toggleAutoReconnect,
    addOrUpdatePeripheral,
    retrieveConnected,
    sleep,
    logsForPeripherals,
    addOrUpdateLogsForPeripheral,
    togglePeripheralBonding,
  };

  return (
    <>
      {/* react-native-orientation-locker (https://github.com/wonday/react-native-orientation-locker) */}
      <OrientationLocker
        orientation={UNLOCK}
        onChange={orientation => console.log("onChange", orientation)}
        onDeviceChange={orientation => console.log("onDeviceChange", orientation)}
      />
      <StatusBar barStyle="light-content" backgroundColor="#222"/>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            gestureEnabled: true,
            headerShown: true,
            headerTintColor: "#fff",
            headerMode: "screen",
            headerStyle: {
              backgroundColor: "#222",
              height: 55,
            },
            title: "",
            headerTitleAlign: "center",
            gestureDirection: "horizontal",
          }}
        >
          <Stack.Screen name="List" options={{
            // title: "設備列表",
            headerRight: () => (
              <TouchableOpacity onPress={clearList} style={{
                marginHorizontal: 20,
                opacity: isScanning ? 0.5 : 1,
              }}>
                <Text style={{ ...styles.topBarText }}>清空列表</Text>
              </TouchableOpacity>
            ),
          }}>
            {(props) => <ScnList {...props} {...bleUtils} />}
          </Stack.Screen>
          <Stack.Screen name="Detail" options={{
            // title: "設備詳情",
            presentation: "card",
          }}>
            {(props) => <ScnDetail {...props} {...bleUtils} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  topBarText: {
    color: "#fff",
    fontSize: 16,
  },
});
export default NavBluetoothDemo;
