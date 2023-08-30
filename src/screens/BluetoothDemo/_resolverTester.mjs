import peripherals from './resolversForPeripherals.mjs'
import utils from './_utils.mjs';

let notification = {}

notification = {
  value: [207, 0, 0, 254, 1, 0, 0, 0, 0, 1, 49],
  valueInHex: ["CF", "00", "00", "FE", "01", "00", "00", "00", "00", "01", "31"],
  valueLength: 11,
  service: "0000fff0-0000-1000-8000-00805f9b34fb",
  characteristic: "0000fff4-0000-1000-8000-00805f9b34fb",
  peripheral: "CF:E6:15:12:02:93",
}

const characteristic = utils.isStandardBLEUUID(notification.characteristic) ?
  notification.characteristic.slice(4, 8) :
  notification.characteristic
const service = utils.isStandardBLEUUID(notification.service) ?
  notification.service.slice(4, 8) :
  notification.service
const interpreter = peripherals
  .find(r => r.name === 'HealthScale').characteristics
  .find(c => c.characteristic === characteristic.toLowerCase() && c.service === service.toLowerCase())
  ._resolver
const res = interpreter(notification.value)
console.log(res)
