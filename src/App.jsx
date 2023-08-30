import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import BleManager from '@/libs/BleManager.mjs';
import * as utils from '@/libs/utils.mjs';

import NavBluetoothDemo from '@/screens/BluetoothDemo/NavBluetoothDemo';

global._app = { BleManager, moment, _, utils };

export default function App() {
  return (<>
    <NavBluetoothDemo/>
  </>);
}
