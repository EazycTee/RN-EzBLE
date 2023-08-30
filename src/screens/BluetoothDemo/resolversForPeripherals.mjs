import utils from './_utils.mjs';
const { tryFn, viewCreator } = utils

// 用於存儲解析後的數據對象
class ResolvedObj {
  message = '';
  isNotifyUI = false;
  isStableData = false;
  isFinished = false;
  isError = false;
  isInitError = false;

  constructor(data = {}) {
    this.data = data;
  }
}


export default [{
  "name": "HealthScale",
  _finder(peripheral) {
    return peripheral?.name?.search(/^Health\s?Scale$/) >= 0
  },
  _linker(context) {
  },
  _initializer(context) {
  },
  "advertising": {
    "serviceUUIDs": ["fff0", "1812"],
    "localName": "Health Scale",
  },
  "characteristics": [
    {
      "properties": {
        "Notify": "Notify"
      },
      "characteristic": "fff4",
      "service": "fff0",
      _title: "體重",
      _resolver: (() => {
        const weightDefault = { value: null, unit: null };
        const heightDefault = { value: null, unit: null };
        let weight = { ...weightDefault };
        let height = { ...heightDefault };

        return function(dataArray) {
          const view = viewCreator(dataArray);
          const res = new ResolvedObj();
          const { data } = res;

          const flagScaleType = tryFn(() => view.getUint8(0));
          if (flagScaleType === 0xCF) res.message = '脂肪秤';
          if (flagScaleType === 0xCE) res.message = '人體秤';
          if (flagScaleType === 0xCB) res.message = '嬰兒秤';
          if (flagScaleType === 0xCA) res.message = '廚房秤';

          // const weight.value = tryFn(() => view.getUint16(3));

          return res;
        }
      })()
    },
  ],
}];
