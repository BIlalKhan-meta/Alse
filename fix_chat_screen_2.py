import re

with open('src/screens/ChatScreen/index.tsx', 'r') as f:
    content = f.read()

# Fix ListEmptyComponent
content = content.replace("ListEmptyComponent={() => <EmptyComponent text={'No chat found'} />}", "ListEmptyComponent={<EmptyComponent text={'No chat found'} />}")

# Fix curly braces in onScroll
old_onscroll = """          onScroll={() => {
            if (menuVisible) setMenuVisible(false);
            if (filterVisible) setFilterVisible(false);
          }}"""
new_onscroll = """          onScroll={() => {
            if (menuVisible) { setMenuVisible(false); }
            if (filterVisible) { setFilterVisible(false); }
          }}"""
content = content.replace(old_onscroll, new_onscroll)

# Remove trailing spaces
content = "\n".join([line.rstrip() for line in content.split("\n")])

with open('src/screens/ChatScreen/index.tsx', 'w') as f:
    f.write(content)

with open('src/screens/ChatScreen/styles.tsx', 'r') as f:
    styles_content = f.read()

styles_content = styles_content.replace("import {Platform, StyleSheet} from 'react-native';", "import {StyleSheet} from 'react-native';")
styles_content = styles_content.replace("import {fontSizes, vh, vw} from '../../constant';\n", "")

with open('src/screens/ChatScreen/styles.tsx', 'w') as f:
    f.write(styles_content)

print("Fixed index.tsx and styles.tsx successfully")
