import RNFS from 'react-native-fs';
import moment from 'moment';
import _ from 'lodash';
import { tryFn, stringify, formatBytes } from '@/libs/utils.mjs';
import { Platform } from "react-native";
import config from '@/app.config.js';


// 記錄到文件，並在控制台輸出
const cacheLogger = {
  error: (...args) => append(true, 'error', ...args), // 最高級別，表示發生了嚴重的錯誤，需要手動修復
  warn: (...args) => append(true, 'warn', ...args), // 次高級別，表示發生了異常的情況，但是程序能自動恢復
  info: (...args) => append(true, 'info', ...args), // 中等級別，表示一些通用的信息，用於記錄程序的狀態或配置
  log: (...args) => append(true, 'log', ...args), // 次中等級別，表示一些調試用的信息，用於顯示程序的運行流程或變量值
  debug: (...args) => append(true, 'debug', ...args), // 最低級別，表示一些細節化的信息，用於追蹤程序的執行過程或找出特定的問題
}
export default cacheLogger;

// 僅記錄到文件，不在控制台輸出
export const cache = {
  error: (...args) => append(false, 'error', ...args),
  warn: (...args) => append(false, 'warn', ...args),
  info: (...args) => append(false, 'info', ...args),
  log: (...args) => append(false, 'log', ...args),
  debug: (...args) => append(false, 'debug', ...args),
}

export const dirPathForLogFiles = Platform.select({
  android: RNFS.ExternalDirectoryPath + '/logs'
});

function append(print, type, ...args) {
  if (print) console[type]('|cLog|', ...args);
  const m = moment().utcOffset(+8);
  RNFS.appendFile(
    `${dirPathForLogFiles}/${m.format('YYYYMMDD')}.log`,
    '# ' + `[${m.format()}][${type.toUpperCase()}]\n` +
    '- ' + args.map(arg => stringify(arg)).join('\n- ') +
    '\n\n',
    'utf8'
  ).catch((err) => console.warn(err.message));
}

export async function deleteOldLogFiles() {
  const expireDays = config.cacheLoggerExpireDays;
  const expireDate = moment().subtract(expireDays, 'days');

  try {
    const files = (await RNFS.readDir(dirPathForLogFiles))
      .sort((a, b) => moment(a.mtime) - moment(b.mtime)); // 按時間升序排序（舊的在前）
    let remainFileCount = files.length;

    for (let file of files) {
      if (remainFileCount <= expireDays) break; // 當文件數量超過 expireDays 才考慮刪除

      const stat = await RNFS.stat(file.path);
      const fileDate = moment(stat.mtime);
      if (fileDate.isBefore(expireDate)) {
        await RNFS.unlink(file.path);
        remainFileCount -= 1;
        cacheLogger.log(`[cacheLogger] Log file deleted:`, file.path);
      }
    }
  } catch (err) {
    cacheLogger.warn(err);
  }

  const infoObj = Object.fromEntries(
    Object.entries(await RNFS.getFSInfo())
      .map(([key, val]) => [key, formatBytes(val)])
  )
  cacheLogger.log('[cacheLogger] RNFS.getFSInfo():', infoObj)
}

// 創建日誌文件夾
RNFS.mkdir(dirPathForLogFiles)
  .catch((err) => console.warn(err.message));

