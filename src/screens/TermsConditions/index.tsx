import { View } from "react-native";
import WebView from "react-native-webview";


const TermsConditions: React.FC = () => {
 
  return (
    <WebView source={{ uri: 'https://alse.site/terms-conditions/' }} style={{ flex: 1 }} />
  );
};

export default TermsConditions;
