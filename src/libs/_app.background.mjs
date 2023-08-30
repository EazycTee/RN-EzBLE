import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import BleManager from "@/libs/BleManager.mjs";
import moment from 'moment';
import cacheLogger from '@/libs/cacheLogger.mjs';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const rootListeners = [
  bleManagerEmitter.addListener("BleManagerDiscoverPeripheral", (peripheral) => {
    if (!peripheral.name) return;
    if (!peripheral.advertising.isConnectable) return;
    // console.log('BleManagerDiscoverPeripheral', peripheral, peripheral.name, peripheral.advertising.serviceUUIDs.join(' '))

    cachePeripheral(peripheral);
  }),
];

const cachedPeripherals = new Map();
const peripheralsCacheTime = 9 * 1000; // 需小於 actionTimeout，以避免重複 _connect()

function cachePeripheral(peripheral) {
  const { id, name, rssi, advertising } = peripheral;
  cachedPeripherals.set(id, {
    id, name, rssi,
    advertising: { serviceUUIDs: advertising?.serviceUUIDs ?? [] },
    time: moment().utcOffset(+8).format(),
  });
}

async function syncDiscoveredPeripheral() {
  const peripherals = await BleManager.getDiscoveredPeripherals();
  peripherals.forEach(peripheral => {
    if (!cachedPeripherals.has(peripheral.id)) cachePeripheral(peripheral);
  })
}

setInterval(async () => {
  if (await BleManager.checkState() === 'on') {
    cachedPeripherals.forEach((p, id) => {
      if (moment().diff(moment(p.time)) > peripheralsCacheTime) cachedPeripherals.delete(id);
    });
    // await syncDiscoveredPeripheral();
    cacheLogger.debug('[ControllerBLE] cachedPeripherals:', Array.from(cachedPeripherals.values()))
  }
}, 5000);
