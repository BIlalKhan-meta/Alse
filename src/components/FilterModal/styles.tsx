import { StyleSheet } from "react-native";
import { vh, vw } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({

  dots: {
    padding: 10,
  },
  modalBackground: {
    // flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // justifyContent: 'flex-end',
    alignItems: 'center',
    width: vw * 40,
    // alignSelf: "flex-end",
    // marginTop: vh * 8,
    // marginRight: vw * 12,
    position: "absolute",
    right: vh * 2,
    // top: 55
    // elevation: 4,
    // borderWidth: 1
    zIndex: 100,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    // marginBottom: 20,
    width: "100%",
    elevation: 5,
    paddingVertical: vh * 2,
    paddingLeft: vw * 2

  },
  modalOption: {
    paddingVertical: vh * 0.5,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  textinputbox: {
    backgroundColor: colors.inputColor,
    width: vw * 35,
    height: vh * 4,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: vw * 2,
    marginTop: vh * 2
  },
  dropdownContainer: {
    marginTop: vh * 1.4,
    width: vw * 35,

    backgroundColor: colors.inputColor,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 30,
    zIndex: 99
  },
  dropDown: {
    borderColor: 'white',
    // backgroundColor: colors.dateConatiner,
    backgroundColor: colors.inputColor,

    borderWidth: 1
  },
});

export default styles;