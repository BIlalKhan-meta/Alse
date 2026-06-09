import re

with open('src/components/PostComponent/index.tsx', 'r') as f:
    content = f.read()

content = content.replace("""  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: 'bold',
  },
  time: {
    fontSize: fontSizes.f12,
    color: colors.lightGrey,
  },""", """  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#65676B',
    marginTop: 2,
  },""")

content = content.replace("""  postText: {
    fontSize: fontSizes.f14,
    color: colors.inputText,
    lineHeight: 20,
  },""", """  postText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },""")

content = content.replace("""  readMoreText: {
    color: colors.lightGrey,
  },""", """  readMoreText: {
    color: '#169BD5',
    fontWeight: '500',
  },""")

content = content.replace("""  postContent: {
    padding: 12,
  },""", """  postContent: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 10,
  },""")

content = content.replace("""  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },""", """  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },""")

content = content.replace("""  textPostActions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    marginTop: 8,
  },""", """  textPostActions: {
    paddingBottom: 5,
  },""")

with open('src/components/PostComponent/index.tsx', 'w') as f:
    f.write(content)

print("Replaced styles successfully")
