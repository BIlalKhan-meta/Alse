import re

with open('src/components/PostComponent/index.tsx', 'r') as f:
    content = f.read()

# Remove the duplicate ShareModal inside the image block
bad_block = """            
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShareToNewsfeed={() => {
          setShareModalVisible(false);
          postShare();
        }}
        onSendToChats={(selectedIds) => {
          setShareModalVisible(false);
          // TODO: Implement sending to specific chats
          console.log('Sending to chats:', selectedIds);
        }}
      />
    </Pressable>"""

content = content.replace(bad_block, "")

with open('src/components/PostComponent/index.tsx', 'w') as f:
    f.write(content)

print("Fixed successfully")
