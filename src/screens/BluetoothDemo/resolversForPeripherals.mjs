
import utils from '@/libs/utils.mjs';

const { tryFn, viewCreator } = utils

export default [
  {
    "name": "TEMP",
    "id": "10:CE:A9:35:6D:57",
    "characteristics": [
      {
        "characteristic": "2a1c",
        "service": "1809",
        title: "體溫",
        resolver(dataArray) {
          const view = viewCreator(dataArray)

          // 获取溫度单位 (第 0 個元素的第 0 個 bit 為 0 時表示溫度單位為攝氏度)
          const unit = tryFn(() => (view.getUint8(0) & 0) === 0 ? "℃" : "℉");

          // 獲取溫度類型標記狀態 (第 0 個元素的第 2 個 bit 為 1 時表示溫度類型標記存在)
          const isTempTypePresent = tryFn(() => (view.getUint8(0) & 2) === 1);

          // 獲取溫度類型標記 (第 5 個元素)
          const tempTypeFlag = tryFn(() => isTempTypePresent ? view.getUint8(5) : undefined)

          // 獲取溫度類型
          const tempType = tempTypeFlag ? [undefined, "Armpit", "Body", "Ear (usually ear lobe)", "Finger", "Gastro-intestinal Tract", "Mouth", "Rectum", "Toe", "Tympanum (ear drum)"][tempTypeFlag] : undefined;

          // 获取指数 (大端, 1个字节)
          const exponent = tryFn(() => view.getInt8(4));

          // 获取尾数 (小端, 3个字节)
          view.setInt8(4, 0);
          const mantissa = tryFn(() => view.getInt32(1, true));

          // 计算温度测量值
          const temperature = tryFn(() => (mantissa * Math.pow(10, exponent)).toFixed(2));

          return {
            message: tempType ? `${temperature}${unit} ${tempType}` : `${temperature}${unit}`
          };
        },
      },
    ],
  },
  {
    "name": "Health Scale",
    "id": "CF:E6:15:12:02:93",
    "characteristics": [
      {
        "characteristic": "fff4",
        "service": "fff0",
        title: "體脂",
        resolver(dataArray) {
          const view = viewCreator(dataArray)

          let scaleType = 'ScaleTypeError'
          switch (view.getUint8(0)) {
            case 0xCA:
              scaleType = 'IntermediateMeasurementValue'
              break
            case 0xCF:
              scaleType = 'FatScale'
              break
          }
          console.log(`scaleType: ${scaleType}`)

          const gender = tryFn(() => (view.getUint8(2) & 0b01000000) === 0 ? 'Female' : 'Male')
          console.log(`gender: ${gender}`)

          const age = tryFn(() => (view.getUint8(2) & 0b00111111))
          console.log(`age: ${age}`)

          const bodyHeight = tryFn(() => view.getUint8(3) + 'cm')
          console.log(`bodyHeight: ${bodyHeight}`)

          const bodyWeight = tryFn(() => (view.getUint16(4) * 0.1).toFixed(1) + 'kg')
          console.log(`bodyWeight: ${bodyWeight}`)

          const fat = tryFn(() => (view.getUint16(6) * 0.1).toFixed(1) + '%')
          console.log(`fat: ${fat}`)

          const boneWeight = tryFn(() => (view.getUint8(8) * 0.1).toFixed(1) + 'kg')
          console.log(`boneWeight: ${boneWeight}`)

          const muscle = tryFn(() => (view.getUint16(9) * 0.1).toFixed(1) + '%')
          console.log(`muscle: ${muscle}`)

          const visceraFat = tryFn(() => view.getUint8(11) + '%')
          console.log(`visceraFat: ${visceraFat}`)

          const water = tryFn(() => (view.getUint16(12) * 0.1).toFixed(1) + '%')
          console.log(`water: ${water}`)

          const Kcal = tryFn(() => view.getUint16(14) + 'Kcal')
          console.log(`Kcal: ${Kcal}`)

          // const dataArray = [207, 64, 158, 160, 2, 18, 0, 107, 26, 1, 230, 1, 2, 140, 4, 158]
          // resolver(dataArray)
          // output:
          // scaleType: FatScale
          // gender: Female
          // age: 30
          // bodyHeight: 160cm
          // bodyWeight: 53.0kg
          // fat: 10.7%
          // boneWeight: 2.6kg
          // muscle: 48.6%
          // visceraFat: 1%
          // water: 65.2%
          // Kcal: 1182Kcal
        },
      },
    ],
  },
  {
    "name": "BPM_01",
    "id": "7C:01:0A:E6:85:20",
    "characteristics": [
      {
        "characteristic": "fff4",
        "service": "fff0",
        title: "血壓",
        resolver(dataArray) {
          const view = viewCreator(dataArray)
          const r = {}

          const Flag = tryFn(() => view.getUint8(0))
          r.unit = (Flag & 0b00000001) === 0 ? "mmHg" : "KPA";
          r.timestamp = (Flag & 0b00000010) === 0 ? "default" : "unknown";
          r.withPulseRate = (Flag & 0b00000100) !== 0;
          r.withUserID = (Flag & 0b00001000) !== 0;
          r.withMeasStatus = (Flag & 0b00010000) !== 0;
          r.isTestingData = (Flag & 0b00100000) !== 0;

          // Testing data format
          if (r.isTestingData && Flag === 0b00100000) {
            r.pressure = tryFn(() => view.getUint8(1))
            r._message = `測量中 ${r.pressure ?? '?'}${r.unit}`
          }

          // Normal data format
          else {
            r.systolic = tryFn(() => view.getUint16(1))
            r.diastolic = tryFn(() => view.getUint16(3))
            r.map = tryFn(() => view.getUint16(5))
            r.pulseRate = tryFn(() => view.getUint16(7))
            r.userID = tryFn(() => view.getUint8(9))
            r.measStatus = tryFn(() => view.getUint16(10))
            r._message =
              `上壓 ${r.systolic}${r.unit}, 下壓 ${r.diastolic}${r.unit}` +
              (r.withPulseRate ? `, 脈搏 ${r.pulseRate}BPM` : '')
          }

          return r
        },
      },
    ],
  },
  {
    "name": "Medical",
    "id": "A4:C1:38:9A:C0:D3",
    "characteristics": [
      {
        "characteristic": "cdeacb81-5235-4c07-8846-93a37ee6b86d",
        "service": "cdeacb80-5235-4c07-8846-93a37ee6b86d",
        title: "血氧",
        resolver(dataArray) {
          const view = viewCreator(dataArray)
          const r = {} // result

          const dataType = tryFn(() => view.getUint8(0))

          // Plethysmogram Data format
          if (dataType === 0x80) {
            r.plethysmogram = dataArray.slice(1)
            r._message = `光體積描記圖(略)`
          }

          // Oxygen saturation, Pulse rate and Perfusion Index Data format
          if (dataType === 0x81) {
            r.pulseRate = tryFn(() => view.getUint8(1))
            r.pulseRate = (r.pulseRate === 255) ? null : r.pulseRate + 'BPM'
            r.SpO2 = tryFn(() => view.getUint8(2))
            r.SpO2 = (r.SpO2 === 127) ? null : r.SpO2 + '%'
            r.perfusionIndex = tryFn(() => view.getUint8(3))
            r.perfusionIndex = (r.perfusionIndex === 0) ? null : r.perfusionIndex + '%'
            r._message = `脈搏 ${r.pulseRate}, 血氧 ${r.SpO2}, 血液灌流指數 ${r.perfusionIndex}`
          }

          return r
        },
      },
    ],
  },
];
