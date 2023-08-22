import RNBleManager from "react-native-ble-manager";

const BleManager = {
  start: (...args) => RNBleManager.start(...args),
  scan: (...args) => RNBleManager.scan(...args),
  stopScan: (...args) => RNBleManager.stopScan(...args),
  connect: (...args) => RNBleManager.connect(...args),
  disconnect: (...args) => RNBleManager.disconnect(...args),
  enableBluetooth: (...args) => RNBleManager.enableBluetooth(...args),
  checkState: (...args) => RNBleManager.checkState(...args),
  startNotification: (...args) => RNBleManager.startNotification(...args),
  stopNotification: (...args) => RNBleManager.stopNotification(...args),
  read: (...args) => RNBleManager.read(...args),
  write: (...args) => RNBleManager.write(...args),
  writeWithoutResponse: (...args) => RNBleManager.writeWithoutResponse(...args),
  readRSSI: (...args) => RNBleManager.readRSSI(...args),
  retrieveServices: (...args) => RNBleManager.retrieveServices(...args),
  refreshCache: (...args) => RNBleManager.refreshCache(...args),
  getConnectedPeripherals: (...args) => RNBleManager.getConnectedPeripherals(...args),
  getDiscoveredPeripherals: (...args) => RNBleManager.getDiscoveredPeripherals(...args),
  isPeripheralConnected: (...args) => RNBleManager.isPeripheralConnected(...args),
}

// 為一些高頻調用的方法做緩存
const BleManagerWithCache = {
  checkState: (() => {
    let isInShortDuration = false;
    let cached = '';

    return async () => {
      if (isInShortDuration) return cached;

      isInShortDuration = true
      setTimeout(() => isInShortDuration = false, 200);
      cached = await BleManager.checkState();
      return cached;
    }
  })(),

  getConnectedPeripherals: (() => {
    let isInShortDuration = false;
    let cached = [];

    return async () => {
      if (isInShortDuration) return cached;

      isInShortDuration = true
      setTimeout(() => isInShortDuration = false, 200);
      cached = await BleManager.getConnectedPeripherals();
      return cached;
    }
  })(),
}


let waitingNum = 0;
export default {
  ...BleManager,
  ...BleManagerWithCache,

  autoScan: (() => {
    let scanTimeout = 5000;
    let scanTimer = 0;

    function scan() {
      // if (waitingNum <= 0) return

      clearTimeout(scanTimer)

      BleManager.scan([], (scanTimeout + 200) / 1000);
      scanTimer = setTimeout(() => scan(), 10000);
    }

    return () => scan();
  })(),

  incWaitingNum: () => waitingNum += 1,
  decWaitingNum: () => waitingNum -= 1,
}

// setInterval(() => {
//   BleManager.getDiscoveredPeripherals()
//     .then(ps => {
//       (async () => {
//         let psStrArr = [];
//         for (const p of ps.filter(p => p.name)) {
//           // const isConnected = await BleManager.isPeripheralConnected(p.id);
//           psStrArr.push(`<${p.id}|${p.name}|${p.rssi}}>`);
//           // psStrArr.push(`<${p.name}|${isConnected}>`);
//         }
//         console.log(`[BleDiscoveredPeripherals]`, psStrArr.length, psStrArr.join(' '));
//       })()
//     })
// }, 1000)
