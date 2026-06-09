import re

with open('src/components/CommentsModal/styles.tsx', 'r') as f:
    content = f.read()

content = content.replace("""  commentContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    // width: '80%',
  },""", """  commentContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },""")

content = content.replace("""  userName: {
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: 'bold',
  },""", """  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '600',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },""")

content = content.replace("""  comment: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },""", """  comment: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },""")

content = content.replace("""  likeButton: {
    padding: 10,
  },""", """  likeButton: {
    padding: 5,
  },""")

content = content.replace("""  postActions: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // alignSelf: 'flex-start',
    // backgroundColor: 'red',
    marginBottom: 10,
  },""", """  postActions: {
    flexDirection: 'row',
    marginBottom: 5,
  },""")

content = content.replace("""  actionText: {
    marginRight: 20,
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },""", """  actionText: {
    marginRight: 20,
    marginLeft: 5,
    fontSize: 12,
    color: '#65676B',
  },""")

content = content.replace("""  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },""", """  separator: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 15,
  },""")

content = content.replace("""  inputConatiner: {
    flexDirection: 'row',
    // backgroundColor: "yellow",
    justifyContent: 'space-between',
    alignContent: 'center',
    width: '100%',
    backgroundColor: colors.inputcolor,
    height: vh * 6,
    paddingHorizontal: vw * 2,
    borderRadius: 5,
    bottom: 0,
  },""", """  inputConatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8FAFE',
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },""")

with open('src/components/CommentsModal/styles.tsx', 'w') as f:
    f.write(content)

print("Replaced styles successfully")
