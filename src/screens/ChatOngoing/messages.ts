import {images} from '../../utils/images';

const messagesData = [
  // {
  //   _id: 1,
  //   text: "You don't have any upcoming or in-progress booking with this coach. To chat you must have an upcoming or in-progress booking.",
  //   system: true,
  // },
  {
    _id: 2,
    text: 'When you visit',
    createdAt: new Date(Date.UTC(2016, 5, 12, 17, 20, 0)),
    user: {
      _id: 2,
      // name: 'React Native',
      // avatar: images.user,
    },
  },
  {
    _id: 3,
    text: 'Yes, At Noon',
    createdAt: new Date(Date.UTC(2016, 5, 12, 17, 20, 0)),
    user: {
      _id: 1,
      // name: 'React Native',
      // avatar: images.user,
    },
    // image: 'https://placeimg.com/960/540/any',
  },
  {
    _id: 4,
    text: 'Ok will wait',
    createdAt: new Date(Date.UTC(2016, 5, 13, 17, 20, 0)),
    user: {
      _id: 2,
      // name: 'React Native',
      // avatar: images.user,
    },
  },
  {
    _id: 5,
    text: 'lorem ipsum??',
    createdAt: new Date(Date.UTC(2016, 5, 13, 17, 20, 0)),
    user: {
      _id: 2,
      // name: 'React Native',
      // avatar: images.user,
    },
  },
  {
    _id: 7,
    text: `Yess, At Noon`,
    createdAt: new Date(Date.UTC(2016, 5, 14, 17, 20, 0)),
    user: {
      _id: 1,
      // name: 'React Native',
      // avatar: images.user,
    },
  },
  {
    _id: 8,
    text: 'Ok will wait',
    createdAt: new Date(Date.UTC(2016, 5, 14, 17, 20, 0)),
    user: {
      _id: 2,
      // name: 'React Native',
      // avatar: images.user,
    },
  },
  {
    _id: 9,
    text: 'lorem ipsum??',
    createdAt: new Date(Date.UTC(2016, 5, 14, 17, 20, 0)),
    user: {
      _id: 2,
      // name: 'React Native',
      // avatar: images.user,
    },
  },
];

export default messagesData;
