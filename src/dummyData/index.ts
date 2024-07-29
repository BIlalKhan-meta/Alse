import {images} from '../utils/images';

export const reactions = [
  {
    id: 1,
    userAvatar: 'avatar1.jpg',
    userName: 'Marvel Edward',
    reactionType: 'heart',
  },
  {id: 2, userAvatar: 'avatar2.jpg', userName: 'Madvin', reactionType: 'like'},
  {
    id: 3,
    userAvatar: 'avatar3.jpg',
    userName: 'Marvel Edward',
    reactionType: 'heart',
  },
  {
    id: 4,
    userAvatar: 'avatar2.jpg',
    userName: 'Juliana David',
    reactionType: 'like',
  },
  {
    id: 5,
    userAvatar: 'avatar2.jpg',
    userName: 'Roy Rose',
    reactionType: 'heart',
  },
  {
    id: 6,
    userAvatar: 'avatar2.jpg',
    userName: 'Marvel Edward',
    reactionType: 'like',
  },
  {
    id: 7,
    userAvatar: 'avatar2.jpg',
    userName: 'Colin Shaien',
    reactionType: 'like',
  },
  {
    id: 8,
    userAvatar: 'avatar2.jpg',
    userName: 'Sam Alex',
    reactionType: 'heart',
  },
  {
    id: 9,
    userAvatar: 'avatar2.jpg',
    userName: 'Peter Parker',
    reactionType: 'like',
  },

  // Add more reactions as needed
];

export const dummyComments = [
  {
    id: 1,
    userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    userName: 'John Doe',
    userImage: 'https://via.placeholder.com/150',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 2,
    userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    userName: 'Jane Smith',
    userImage: 'https://via.placeholder.com/150',
    comment:
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 3,
    userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    userName: 'Mike Johnson',
    userImage: 'https://via.placeholder.com/150',
    comment:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

export interface Product {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Product Name 1',
    color: 'Blue',
    size: 'S',
    price: 45,
    image: `${images.pro1}`,
    quantity: 1,
  },
  {
    id: '2',
    name: 'Product Name 2',
    color: 'Blue',
    size: 'S',
    price: 45,
    image: `${images.pro2}`,
    quantity: 1,
  },
  {
    id: '3',
    name: 'Product Name 3',
    color: 'Blue',
    size: 'S',
    price: 45,
    image: `${images.pro1}`,
    quantity: 1,
  },
];
