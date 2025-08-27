# ProductDetail Screen

## Overview

The ProductDetail screen displays detailed information about a specific auction product, allowing users to view product details, place bids, and purchase items directly.

## Features

### Product Information Display

- **Product Image**: Large product image with favorite/heart functionality
- **Product Title**: Product name in large, bold text
- **Description**: Detailed product description
- **Current Bid**: Shows the current highest bid amount
- **Time Remaining**: Countdown timer showing auction end time
- **Seller Information**: Seller avatar, name, and description

### Bidding Interface

- **Bid Adjustment**: Plus/minus buttons to adjust bid amount
- **Bid Increment**: Shows the minimum bid increment ($100)
- **Starting Bid**: Displays the initial auction starting price
- **Latest Bid**: Shows the current highest bid
- **Place Bid**: Button to submit the user's bid

### Action Buttons

- **Place a Bid**: Primary action to place a bid on the item
- **Buy Now**: Direct purchase option (bypasses auction)

### Navigation

- **Close Button**: Returns to the previous screen
- **Shopping Cart**: Access to cart functionality

## Navigation

The screen is accessed from the AuctionBidding screen when a user taps on any product card. It receives a `productId` parameter to fetch the specific product details.

```javascript
navigation.navigate('ProductDetail', {productId: item.id});
```

## API Integration

- Uses `productDetail(productId)` API call to fetch product information
- Displays real product data including images, title, description, and seller information
- Handles loading states and error scenarios

## Styling

- Dark gray background (`#2C2C2C`) matching the design
- White content cards with rounded corners
- Teal accent color (`#0C959B`) for primary actions
- Responsive layout with proper spacing and typography

## State Management

- **Product Data**: Fetched from API and stored in local state
- **Bidding State**: Manages current bid, user bid, and bid validation
- **Timer**: Real-time countdown for auction end time
- **Favorite State**: Toggle for adding/removing from favorites

## Error Handling

- Loading states with spinner
- Error messages for failed API calls
- Validation for bid amounts
- Graceful fallbacks for missing data
