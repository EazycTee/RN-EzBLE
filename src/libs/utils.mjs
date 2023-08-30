import cacheLogger from "@/libs/cacheLogger.mjs";

// 判斷是否為標準的 BLE UUID
export function isStandardBLEUUID(uuid) {
  return uuid.slice(0, 4) === "0000" && uuid.slice(9).toLowerCase() === "0000-1000-8000-00805f9b34fb";
}

// 保留字符串的頭尾
export function getHeadAndTail(str, head = 8, tail = 4) {
  if (str.length < head + tail) {
    return str
  }
  const left = str.slice(0, head);
  const right = str.slice(str.length - tail);
  return left + "..." + right;
}

// 封裝一層函數, 避免 fn() 拋出錯誤
export function tryFn(fn) {
  let res = null;
  try {
    res = fn();
  } catch (e) {
    cacheLogger.warn("fn error", e);
  }
  return res;
}

// 用 dataArray 構造一個 DataView
export function viewCreator(dataArray) {
  const buffer = new ArrayBuffer(dataArray.length);
  const view = new DataView(buffer);
  for (let i = 0; i < dataArray.length; i++) {
    view.setUint8(i, dataArray[i]);
  }
  return view;
}

export function transArrFromDecToHex(decArray) {
  return decArray.map(dec => dec.toString(16).padStart(2, '0').toUpperCase());
}

export function transArrFromHexToDec(hexArray) {
  return hexArray.map(hex => parseInt(hex, 16));
}

// 優化的 JSON.stringify | 可以處理 3 种特殊情況以及對象的循環引用, 但仍無法處理 `symbol-keyed`
export function stringify(obj) {
  const seen = new WeakMap();
  return JSON.stringify(obj, (key, val) => {
    if (typeof val === 'function') return `<function>`;
    if (typeof val === 'undefined') return `<undefined>`;
    if (typeof val === 'symbol') return `<Symbol>${val.description}`;
    if (typeof val === "object" && val !== null) {
      if (seen.has(val)) return `<sameObj>${seen.get(val)}`;
      seen.set(val, key);
    }
    return val;
  })
}

// 以人類可讀的方式轉換存儲容量單位
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function isErrorObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Error]';
}
