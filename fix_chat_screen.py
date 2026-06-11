import re

with open('src/screens/ChatScreen/index.tsx', 'r') as f:
    content = f.read()

# Import TextInput
content = content.replace("  StatusBar,\n  Modal,\n} from 'react-native';", "  StatusBar,\n  TextInput,\n} from 'react-native';")

# Fix curly braces in filteredData
old_filtered = """  const filteredData = data.filter((item: any) => {
    if (activeTab === 'All') return true;
    const isGroup = item?.group === true || item?.is_group === true || item?.type === 'group';
    if (activeTab === 'Groups') return isGroup;
    if (activeTab === 'Chats') return !isGroup;
    return true;
  });"""

new_filtered = """  const filteredData = data.filter((item: any) => {
    if (activeTab === 'All') { return true; }
    const isGroup = item?.group === true || item?.is_group === true || item?.type === 'group';
    if (activeTab === 'Groups') { return isGroup; }
    if (activeTab === 'Chats') { return !isGroup; }
    return true;
  });"""
content = content.replace(old_filtered, new_filtered)

# Remove unused imports and variables
content = re.sub(r"import {colors} from '../../utils/theme';\n", "", content)
content = re.sub(r"import InterMedium from '../../components/Text/InterMedium';\n", "", content)
content = re.sub(r"import InterRegular from '../../components/Text/InterRegular';\n", "", content)
content = re.sub(r"import SearchComponent from '../../components/SearchComponent';\n", "", content)
content = re.sub(r"import CustomeImage from '../../components/CustomeImage';\n", "", content)
content = re.sub(r"  const \[fabMenuVisible, setFabMenuVisible\] = useState\(false\);\n", "", content)

with open('src/screens/ChatScreen/index.tsx', 'w') as f:
    f.write(content)

print("Fixed index.tsx successfully")
