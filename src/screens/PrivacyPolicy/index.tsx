import { View } from "react-native";
import WebView from "react-native-webview";


const PrivacyPolicy: React.FC = () => {
 
  return (
    <WebView source={{ uri: 'https://alse.app/alse-backend/privacy-policy' }} style={{ flex: 1 }} />
  );
};

export default PrivacyPolicy;
