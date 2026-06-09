import re

with open('src/components/PostComponent/index.tsx', 'r') as f:
    content = f.read()

content = content.replace("borderTopLeftRadius: 16,", "borderRadius: 10,")
content = content.replace("borderTopRightRadius: 16,", "marginHorizontal: 15,\n    width: DEVICE_WIDTH - 60,")

with open('src/components/PostComponent/index.tsx', 'w') as f:
    f.write(content)

print("Replaced styles successfully")
