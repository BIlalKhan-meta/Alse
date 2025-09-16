# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Alse (Alenga) is a React Native application that combines social media, e-commerce, live streaming, and educational content. It's a comprehensive platform featuring Instagram-like stories, marketplace functionality, video content, live streams, auctions, and educational blogs/articles.

## Development Commands

### Project Setup
```bash
# Install dependencies
yarn install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### Development
```bash
# Start Metro bundler
yarn start

# Run on Android
yarn android

# Run on iOS  
yarn ios

# Run tests
yarn test

# Lint code
yarn lint

# Build Android APK for debugging
yarn android:debug
```

### Testing
```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test --coverage

# Run tests in watch mode
yarn test --watch
```

## Architecture Overview

### Core Technologies
- **React Native 0.74.1** - Mobile framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management with persistence
- **React Navigation v6** - Navigation (Stack, Bottom Tabs, Material Top Tabs)
- **React Native Reanimated** - Animations
- **Firebase** - Authentication, messaging, Firestore
- **Zoom Video SDK** - Video calling functionality
- **Socket.io** - Real-time messaging
- **Agora** - Live streaming capabilities

### Project Structure
```
src/
├── api/           # API layer with service functions
├── screens/       # 60+ screen components organized by feature
├── navigation/    # Navigation configuration (nested navigators)
├── store/         # Redux store with slices (auth, home, profile, settings, general)
├── components/    # Reusable UI components
├── utils/         # Helper functions, theme, messaging utilities
├── services/      # Business logic services (chat, viewer)
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization setup
├── assets/        # Images, fonts, icons
├── constant/      # App constants
└── dummyData/     # Mock data for development
```

### Key Architectural Patterns

**State Management:**
- Redux Toolkit with persistence (auth slice persisted)
- Separate slices for different domains (auth, home, profile, settings, general)
- Async thunks for API calls with proper error handling

**Navigation Structure:**
- Conditional navigation based on authentication state
- Nested navigators: Stack → Bottom Tabs → Material Top Tabs
- Feature-based navigation organization (HomeNavigation, MarketPlaceNavigator, etc.)

**API Layer:**
- Centralized endpoints configuration in `src/api/endpoints.ts`
- Service functions grouped by feature (auth, home, profile, shop, etc.)
- Consistent error handling across all API calls

**Real-time Features:**
- Socket.io for chat messaging
- Firebase messaging for push notifications
- Zoom SDK integration for video calls
- Agora SDK for live streaming

### Major Features & Screens

**Authentication Flow:**
- Login/Signup with social auth (Google, Apple)
- OTP verification
- Password reset flow

**Social Media:**
- News feed with posts, images, videos
- Instagram-like stories functionality
- User profiles with followers/following
- Real-time chat and messaging
- Video calls integration

**E-commerce:**
- Multi-vendor marketplace
- Product listings with categories
- Shopping cart and checkout
- Order tracking and management
- Seller dashboard and shop management

**Content & Education:**
- Blog articles and educational videos
- Content creation and management
- Video streaming capabilities

**Live Features:**
- Live streaming with Agora
- Real-time auctions and bidding
- Live chat during streams

**Additional Features:**
- Subscription plans and payment logs
- Rider/delivery system
- Settings and privacy controls
- Multi-language support (i18n)
- Push notifications

## Development Guidelines

### Code Style
- ESLint configuration: `@react-native` preset
- Prettier configuration with single quotes, no bracket spacing
- TypeScript strict mode enabled

### State Management Patterns
- Use typed selectors: `selectBearerToken`, `selectUserProfile`
- Implement proper loading states in async thunks
- Persist only necessary data (currently auth slice)

### API Integration
- Use centralized endpoint definitions
- Implement consistent error handling in thunks
- Follow the existing async thunk patterns for new API calls

### Navigation Patterns
- Use typed navigation props
- Implement proper screen options for headers and styling
- Follow the conditional navigation pattern for auth/app flows

### Testing
- Jest configuration with React Native preset
- Focus on testing business logic in thunks and utilities
- Test navigation flows and component interactions

### Performance Considerations
- Use FlashList instead of FlatList for large datasets
- Implement proper image caching and optimization
- Use React Native Reanimated for smooth animations
- Optimize Redux store structure to prevent unnecessary re-renders

## Common Development Tasks

### Adding New API Endpoints
1. Add endpoint to `src/api/endpoints.ts`
2. Create service function in appropriate API file
3. Add async thunk to relevant slice if needed
4. Update TypeScript types

### Adding New Screens
1. Create screen component in appropriate `src/screens/` directory
2. Add to navigation configuration
3. Implement proper navigation types
4. Add any required API integration

### Implementing Real-time Features
- Chat: Use existing Socket.io service in `src/utils/socket.ts`
- Live streams: Integrate with Agora service patterns
- Push notifications: Use Firebase messaging utilities

### Debugging
- Network logger available in development mode
- Redux DevTools integration
- React Native Debugger support
- Flipper integration available
