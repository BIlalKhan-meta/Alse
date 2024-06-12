import { StyleSheet } from "react-native";
import { fontSizes } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
    },
    checkbox: {
      marginRight: 10,
    },
    label: {
      fontSize: fontSizes.f12,
      color:colors.inputText
    },
  });

  export default styles