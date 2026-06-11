import re

with open('src/screens/ChatScreen/styles.tsx', 'r') as f:
    content = f.read()

content = content.replace("#379696", "colors.themeColor")

with open('src/screens/ChatScreen/styles.tsx', 'w') as f:
    f.write(content)

print("Fixed colors successfully")
