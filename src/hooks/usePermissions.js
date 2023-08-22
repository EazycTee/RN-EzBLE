import React from "react";
import {
  Platform,
  PermissionsAndroid,
} from "react-native";
import cacheLogger from "@/libs/cacheLogger.mjs";

export default () => {
  const [isPermissionsReady, setIsPermissionsReady] = React.useState(false);

  async function requestAndroidPermissions() {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]); // { "xxx": ['granted', 'denied', 'never_ask_again'] }
      cacheLogger.log('[AndroidPermissions] PermissionsAndroid.requestMultiple():', results);
      if (
        results &&
        results['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
        results['android.permission.BLUETOOTH_SCAN'] === 'granted'
      ) return setIsPermissionsReady(true);

      setIsPermissionsReady(false);
      throw new Error("[AndroidPermissions] User refuses runtime permissions android 12+")
    }

    if (Platform.OS === "android" && Platform.Version >= 23) {
      const isPermissionGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION); // [true, false]
      cacheLogger.log('[AndroidPermissions] PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)', isPermissionGranted)
      if (isPermissionGranted) return setIsPermissionsReady(true);

      const permissionStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION); // ['granted', 'denied', 'never_ask_again']
      cacheLogger.log('[AndroidPermissions] PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION):', permissionStatus);
      if (permissionStatus && permissionStatus !== 'never_ask_again') return setIsPermissionsReady(true);

      setIsPermissionsReady(false);
      throw new Error("[AndroidPermissions] User refuses runtime permission android <12")
    }
  }

  return {
    requestAndroidPermissions,
    isPermissionsReady,
  };
}
