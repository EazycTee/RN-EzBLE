import resolvers from './resolversForPeripherals.mjs'

let notification = {}

notification = {
  "value": [128, 53, 54, 54, 55, 55, 54, 54, 53, 53, 52],
  "service": "cdeacb80-5235-4c07-8846-93a37ee6b86d",
  "characteristic": "cdeacb81-5235-4c07-8846-93a37ee6b86d",
  "peripheral": "A4:C1:38:9A:C0:D3",
}

// notification = {
//   "value": [129, 255, 127, 0],
//   "service": "cdeacb80-5235-4c07-8846-93a37ee6b86d",
//   "characteristic": "cdeacb81-5235-4c07-8846-93a37ee6b86d",
//   "peripheral": "A4:C1:38:9A:C0:D3",
// }
//
// notification = {
//   "value": [129, 68, 88, 11],
//   "service": "cdeacb80-5235-4c07-8846-93a37ee6b86d",
//   "characteristic": "cdeacb81-5235-4c07-8846-93a37ee6b86d",
//   "peripheral": "A4:C1:38:9A:C0:D3",
// }


const resolver = resolvers
  .find(r => r.id === notification.peripheral).characteristics
  .find(c => c.characteristic === notification.characteristic.toUpperCase())
  .resolver
const res = resolver(notification.value)
console.log(res)
