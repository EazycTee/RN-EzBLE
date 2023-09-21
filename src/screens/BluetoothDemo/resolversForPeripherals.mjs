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


export default [];
