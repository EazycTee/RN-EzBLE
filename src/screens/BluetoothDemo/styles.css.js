import { StyleSheet } from "react-native";

export default StyleSheet.create({
  main: {
    minHeight: "100%",
    backgroundColor: "#ccc",
  },
  content: {
    // marginTop: 50,
    gap: 0,
    minHeight: "100%",
  },
  contentEmpty: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
  },
  deviceListContainer: {
    gap: 0,
    paddingBottom: 200,
  },
  deviceList: {
    backgroundColor: "#ccc",
  },
  contentList: {
    backgroundColor: "#ccc",
    // height: Dimensions.get("window").height - 400,
    flex: 1,
  },
  contentItem: {
    backgroundColor: "#fff",
    marginBottom: 1,
  },
  contentItemHeader: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: "#000",
  },
  contentItemInfo: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
});
