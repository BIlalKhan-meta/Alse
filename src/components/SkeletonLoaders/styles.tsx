import {vh, vw} from '../../constant';

const styles = {
  container: {
    backgroundColor: '#fff',
    marginBottom: vh * 2,
    paddingVertical: vh * 2,
    paddingHorizontal: vw * 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh * 1.5,
  },
  headerText: {
    marginLeft: vw * 3,
    flex: 1,
  },
  postText: {
    marginTop: vh * 1,
  },
  engagementBar: {
    position: 'absolute',
    right: vw * 4,
    alignItems: 'center',
    gap: vw * 4,
    bottom: vh * 4,
  },
  likesCount: {
    marginTop: vh * 1,
  },
};

export default styles;
