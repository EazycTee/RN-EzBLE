import { StyleSheet, Dimensions } from 'react-native';

export const vw = number => Dimensions.get('window').width * (number / 100);

export const vh = number => Dimensions.get('window').height * (number / 100);

export const vmin = number => Math.min(
  Dimensions.get('window').width * (number / 100),
  Dimensions.get('window').height * (number / 100),
);

export const vmax = number => Math.max(
  Dimensions.get('window').width * (number / 100),
  Dimensions.get('window').height * (number / 100),
);

export const barItemSize = Math.max(vmin(7.5), 36);

export const colors = {
  primary: '#3871a9',
  secondary: '#666',
  warning: '#d7a137',
  info: '#69d',
  success: '#52a452',
  danger: '#d63',

  light: '#fff',
  light2: '#eee',
  light3: '#ddd',
  gray: '#999',
  dark: '#000',
}

const button = {
  backgroundColor: '#FFFFFF',
  color: colors.danger,
  borderRadius: vmax(1),
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: vmax(1),
  paddingHorizontal: vmax(1),
}

const text = {
  fontWeight: 'bold',
  fontSize: vmax(2.5),
  color: '#FFFFFF'
}

export default StyleSheet.create({
  main: {
    height: '100%',
    backgroundColor: colors.light,
  },
  globalLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  button: {
    ...button,
  },
  buttonSuccess: {
    ...button,
    backgroundColor: colors.success,
  },
  buttonWarning: {
    ...button,
    backgroundColor: colors.warning,
  },
  buttonSecondary: {
    ...button,
    backgroundColor: colors.secondary,
  },
  buttonDanger: {
    ...button,
    backgroundColor: colors.danger,
  },
  buttonLight: {
    ...button,
    backgroundColor: colors.light,
    color: colors.primary,
  },
  buttonLightSecondary: {
    ...button,
    backgroundColor: colors.light,
    color: colors.secondary,
  },
  buttonLightWarning: {
    ...button,
    backgroundColor: colors.light,
    color: colors.warning,
  },
  buttonLightDanger: {
    ...button,
    backgroundColor: colors.light,
    color: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  text: {
    ...text,
  },
  textLight: {
    ...text,
    color: colors.light,
  },
  textPrimary: {
    ...text,
    color: colors.primary,
  },

  textGray: {
    ...text,
    color: colors.gray,
  },
  textSecondary: {
    ...text,
    color: colors.secondary,
  },
  textDark: {
    ...text,
    color: colors.dark,
  },
  textWarning: {
    ...text,
    color: colors.warning,
  },
  textDanger: {
    ...text,
    color: colors.danger,
  },
  textSuccess: {
    ...text,
    color: colors.success,
  },

  headerContainer: {
    backgroundColor: colors.primary,
    paddingVertical: vmax(1),
    paddingHorizontal: vmax(2),
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },

  memberHeaderContainer: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  visitorHeaderContainer: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: vmax(7.5)
  },
  memberButton: {
    marginRight: vmax(2),
    justifyContent: 'center'
  },
  visitorButton: {
    marginRight: vmax(2),
    paddingVertical: vmax(1),
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: vmax(2),
    marginTop: vmax(0.5),
    marginBottom: vmax(0.5)
  },
  circle: {
    width: vmax(6.5),
    height: vmax(6.5),
    borderRadius: 50
  },
  memberName: {
    color: '#ffffff',
    fontSize: vmax(3),
    marginLeft: vmax(0.5)
  },

  footerContainer: {
    backgroundColor: colors.light3,
    paddingVertical: vmax(1),
    paddingHorizontal: vmax(2),
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },

  contentContainer: {
    // height: '100%',
    // paddingVertical: 10,
    paddingHorizontal: vmax(2),
    backgroundColor: colors.light3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vmax(1),
  },
  graphContainer: {
    backgroundColor: colors.light,
    flex: 1,
    borderRadius: vmax(1),
    padding: vmax(1),
  },
  infoContainer: {
    backgroundColor: colors.light,
    flex: 0,
    width: '40%',
    borderRadius: vmax(1),
    padding: vmax(1),
  },
  actionContainer: {
    backgroundColor: colors.light2,
    flex: 0,
    width: '14%',
    borderRadius: vmax(1),
    padding: vmax(1),
  },

  dt: {
    fontSize: vmax(2.5),
    color: colors.gray,
    fontWeight: 'bold',
    // marginBottom: vmax(1),
    // marginVertical: vmax(1),
  },
  ddView: {
    marginHorizontal: vmax(1.5),
    borderRadius: vmax(1)
  },
  dd: {
    fontSize: vmax(3),
    fontWeight: 'bold',
    marginHorizontal: vmax(1.5),
    // marginBottom: vmax(1),
    // marginVertical: vmax(1),
  },
  valueView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: vmax(6)
  },
  item: {
    fontSize: vmax(3),
    fontWeight: 'bold',
    color: '#1D2028',
    marginBottom: vmax(1.5)
  },
  value: {
    fontSize: vmax(8),
    fontWeight: 'bold',
    color: '#1D2028',
    marginLeft: vmax(0.5)
  },
  unit: {
    fontSize: vmax(3),
    fontWeight: 'bold',
    color: '#666666',
    marginLeft: vmax(1.5),
    marginBottom: vmax(1.5)
  },

  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'flex-end',
  },
  switchText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
});
