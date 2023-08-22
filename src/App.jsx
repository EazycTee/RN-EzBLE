import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import BleManager from '@/libs/BleManager.mjs';

import NavBluetoothDemo from '@/screens/BluetoothDemo/NavBluetoothDemo';

global._app = { BleManager, moment, _ };


export default function App() {
  return (<>
    <NavBluetoothDemo/>
  </>);
}
