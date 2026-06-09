import re

with open('src/components/PostComponent/index.tsx', 'r') as f:
    content = f.read()

# Add ShareModal import
if 'import ShareModal from \'../ShareModal\';' not in content:
    content = content.replace('import ReportBlockModal from \'../ReportBlockModal\';', 'import ReportBlockModal from \'../ReportBlockModal\';\nimport ShareModal from \'../ShareModal\';')

# Add state
if 'const [shareModalVisible, setShareModalVisible] = useState(false);' not in content:
    content = content.replace('const [error, setError] = useState(false);', 'const [error, setError] = useState(false);\n  const [shareModalVisible, setShareModalVisible] = useState(false);')

# Update postShare to handle the actual share, and add openShareModal
content = content.replace('const postShare = async () => {', 'const handleOpenShareModal = () => {\n    setShareModalVisible(true);\n  };\n\n  const postShare = async () => {')

# Update the share buttons to call handleOpenShareModal
content = content.replace('onPress={postShare}', 'onPress={handleOpenShareModal}')

# Add ShareModal to the return statement
share_modal_jsx = """
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
    </Pressable>
"""
content = content.replace('    </Pressable>', share_modal_jsx)

with open('src/components/PostComponent/index.tsx', 'w') as f:
    f.write(content)

print("Replaced successfully")
