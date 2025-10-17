# JeevanPath - Healthcare Resource Locator

JeevanPath is a comprehensive healthcare resource locator application that helps users find nearby medical facilities, pharmacies, and blood banks. The application features a React Native frontend with Expo and a Node.js/Express backend with MongoDB.

## 🏗️ Project Architecture

```
jeevan_path/
├── backend/          # Node.js/Express API server
├── frontend/         # React Native/Expo mobile application
└── README.md         # This file
```

## 🚀 Features

### Core Functionality
- **Location-based Search**: Find healthcare resources near your location
- **Multi-language Support**: Internationalization with i18next
- **Voice Search**: Voice-activated search capabilities
- **Offline Support**: Works without internet connection
- **Real-time Maps**: Interactive maps with Google Maps integration
- **User Authentication**: Firebase-based authentication system
- **Feedback System**: Rate and review healthcare facilities

### Resource Types
- **Clinics**: Medical clinics and healthcare centers
- **Pharmacies**: Medicine and pharmaceutical stores
- **Blood Banks**: Blood donation and storage facilities

### Advanced Features
- **Smart Filtering**: Filter by type, rating, services, languages, insurance, accessibility
- **Accessibility Support**: Wheelchair accessibility information
- **Transportation Options**: Public transit, walking distance, parking information
- **Dark/Light Theme**: Adaptive theming system
- **Device Management**: Multi-device user support

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK + JWT
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Zod
- **Development**: ts-node-dev, Morgan logging

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Jotai
- **Maps**: React Native Maps
- **Authentication**: Firebase
- **Internationalization**: i18next
- **UI Components**: Expo Vector Icons
- **Fonts**: Google Fonts (Inter, Poppins, JetBrains Mono)

### Database
- **Primary Database**: MongoDB Atlas
- **Connection**: Mongoose ODM
- **Geospatial Indexing**: 2dsphere for location queries

## 📱 Mobile App Features

### Screens
- **Splash Screen**: App initialization and loading
- **Login Screen**: Firebase authentication
- **OTP Screen**: Phone number verification
- **Home Screen**: Main search interface
- **Search Screen**: Advanced search with filters
- **Map Results Screen**: Interactive map view
- **Resource Details Screen**: Detailed facility information
- **Settings Screen**: App preferences and language settings
- **Voice Chat Screen**: Voice-activated search
- **Offline Screen**: Offline mode indicator
- **Location Permission Screen**: Location access setup

### Navigation
- **Root Navigator**: Main navigation container
- **Tabs Navigator**: Bottom tab navigation
- **Stack Navigation**: Screen transitions

## 🔧 Backend API

### Models
- **User**: User profiles with device management
- **Resource**: Healthcare facilities with geospatial data
- **Feedback**: User ratings and reviews

### Controllers
- **Users**: User management and authentication
- **Resources**: Healthcare facility CRUD operations
- **Feedback**: Rating and review management
- **Settings**: User preferences

### Routes
- `/api/users` - User management
- `/api/resources` - Healthcare resources
- `/api/feedback` - Ratings and reviews
- `/api/settings` - User settings

### Middleware
- **Authentication**: JWT token validation
- **CORS**: Cross-origin resource sharing
- **Security**: Helmet for security headers
- **Logging**: Morgan request logging

## 🗄️ Database Schema

### User Collection
```typescript
{
  firebaseUid: string;
  name?: string;
  phone?: string;
  language?: string;
  devices: DeviceInfo[];
  createdAt: Date;
}
```

### Resource Collection
```typescript
{
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood';
  address?: string;
  contact?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  openTime?: string;
  closeTime?: string;
  rating?: number;
  services?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  transportation?: string[];
  wheelchairAccessible?: boolean;
}
```

### Feedback Collection
```typescript
{
  userId: ObjectId;
  resourceId: ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Firebase project
- Expo CLI
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   PORT=4000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   Update `src/firebase/firebase.ts` with your Firebase configuration

4. **Start development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## 📦 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run dev:all` - Start both backend and frontend
- `npm run expo` - Start Expo development server

### Frontend Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Resources
- `GET /api/resources` - Get all resources with filters
- `GET /api/resources/:id` - Get specific resource
- `POST /api/resources` - Create new resource (admin)
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/:resourceId` - Get feedback for resource
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Firebase Integration**: Google Firebase authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers and protection
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API rate limiting (configurable)

## 📱 Mobile App Configuration

### Permissions
- **Location**: Fine and coarse location access
- **Camera**: For profile pictures (if implemented)
- **Microphone**: For voice search functionality

### Platform Support
- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 11.0+
- **Web**: Modern browsers with PWA support

## 🎨 Theming and UI

### Theme System
- **Dark/Light Mode**: Automatic system theme detection
- **Custom Colors**: Brand-specific color palette
- **Typography**: Google Fonts integration
- **Responsive Design**: Adaptive layouts for different screen sizes

### Internationalization
- **Multi-language Support**: English and other languages
- **Dynamic Language Switching**: Runtime language changes
- **RTL Support**: Right-to-left language support

## 🗺️ Maps and Location

### Google Maps Integration
- **Interactive Maps**: Touch and zoom functionality
- **Location Markers**: Custom markers for healthcare facilities
- **Directions**: Navigation to selected facilities
- **Geospatial Queries**: MongoDB 2dsphere indexing

### Location Features
- **Current Location**: GPS-based location detection
- **Location Permissions**: Graceful permission handling
- **Offline Maps**: Cached map data for offline use

## 📊 Performance Optimizations

### Backend
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis caching (if implemented)
- **Compression**: Gzip compression for API responses

### Frontend
- **Lazy Loading**: Component and screen lazy loading
- **Image Optimization**: Optimized image loading
- **Bundle Splitting**: Code splitting for smaller bundles
- **Memory Management**: Efficient state management

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB integration testing

### Frontend Testing
- **Component Tests**: React component testing
- **Navigation Tests**: Screen navigation testing
- **E2E Tests**: End-to-end user flow testing

## 🚀 Deployment

### Backend Deployment
- **Production Build**: `npm run build`
- **Environment Variables**: Production configuration
- **Database**: MongoDB Atlas production cluster
- **Hosting**: Heroku, AWS, or similar platform

### Frontend Deployment
- **Expo Build**: `expo build`
- **App Stores**: Google Play Store and Apple App Store
- **OTA Updates**: Expo Updates for over-the-air updates

## 📈 Monitoring and Analytics

### Backend Monitoring
- **Logging**: Morgan HTTP request logging
- **Error Tracking**: Centralized error logging
- **Performance**: API response time monitoring

### Frontend Analytics
- **User Analytics**: User behavior tracking
- **Crash Reporting**: Error and crash reporting
- **Performance**: App performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v0.1.0** - Development version with basic features

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications for nearby emergencies
- [ ] Telemedicine integration
- [ ] Appointment booking system
- [ ] Health records integration
- [ ] Community health forums
- [ ] Emergency contact system
- [ ] Health tips and articles
- [ ] Medication reminders

### Technical Improvements
- [ ] Advanced caching strategies
- [ ] Real-time updates with WebSockets
- [ ] Machine learning for personalized recommendations
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant architecture
- [ ] Microservices migration

---

**JeevanPath** - Connecting people to healthcare resources, one location at a time. 🏥📍
# JeevanPath - Healthcare Resource Locator

JeevanPath is a comprehensive healthcare resource locator application that helps users find nearby medical facilities, pharmacies, and blood banks. The application features a React Native frontend with Expo and a Node.js/Express backend with MongoDB.

## 🏗️ Project Architecture

```
jeevan_path/
├── backend/          # Node.js/Express API server
├── frontend/         # React Native/Expo mobile application
└── README.md         # This file
```

## 🚀 Features

### Core Functionality
- **Location-based Search**: Find healthcare resources near your location
- **Multi-language Support**: Internationalization with i18next
- **Voice Search**: Voice-activated search capabilities
- **Offline Support**: Works without internet connection
- **Real-time Maps**: Interactive maps with Google Maps integration
- **User Authentication**: Firebase-based authentication system
- **Feedback System**: Rate and review healthcare facilities

### Resource Types
- **Clinics**: Medical clinics and healthcare centers
- **Pharmacies**: Medicine and pharmaceutical stores
- **Blood Banks**: Blood donation and storage facilities

### Advanced Features
- **Smart Filtering**: Filter by type, rating, services, languages, insurance, accessibility
- **Accessibility Support**: Wheelchair accessibility information
- **Transportation Options**: Public transit, walking distance, parking information
- **Dark/Light Theme**: Adaptive theming system
- **Device Management**: Multi-device user support

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK + JWT
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Zod
- **Development**: ts-node-dev, Morgan logging

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Jotai
- **Maps**: React Native Maps
- **Authentication**: Firebase
- **Internationalization**: i18next
- **UI Components**: Expo Vector Icons
- **Fonts**: Google Fonts (Inter, Poppins, JetBrains Mono)

### Database
- **Primary Database**: MongoDB Atlas
- **Connection**: Mongoose ODM
- **Geospatial Indexing**: 2dsphere for location queries

## 📱 Mobile App Features

### Screens
- **Splash Screen**: App initialization and loading
- **Login Screen**: Firebase authentication
- **OTP Screen**: Phone number verification
- **Home Screen**: Main search interface
- **Search Screen**: Advanced search with filters
- **Map Results Screen**: Interactive map view
- **Resource Details Screen**: Detailed facility information
- **Settings Screen**: App preferences and language settings
- **Voice Chat Screen**: Voice-activated search
- **Offline Screen**: Offline mode indicator
- **Location Permission Screen**: Location access setup

### Navigation
- **Root Navigator**: Main navigation container
- **Tabs Navigator**: Bottom tab navigation
- **Stack Navigation**: Screen transitions

## 🔧 Backend API

### Models
- **User**: User profiles with device management
- **Resource**: Healthcare facilities with geospatial data
- **Feedback**: User ratings and reviews

### Controllers
- **Users**: User management and authentication
- **Resources**: Healthcare facility CRUD operations
- **Feedback**: Rating and review management
- **Settings**: User preferences

### Routes
- `/api/users` - User management
- `/api/resources` - Healthcare resources
- `/api/feedback` - Ratings and reviews
- `/api/settings` - User settings

### Middleware
- **Authentication**: JWT token validation
- **CORS**: Cross-origin resource sharing
- **Security**: Helmet for security headers
- **Logging**: Morgan request logging

## 🗄️ Database Schema

### User Collection
```typescript
{
  firebaseUid: string;
  name?: string;
  phone?: string;
  language?: string;
  devices: DeviceInfo[];
  createdAt: Date;
}
```

### Resource Collection
```typescript
{
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood';
  address?: string;
  contact?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  openTime?: string;
  closeTime?: string;
  rating?: number;
  services?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  transportation?: string[];
  wheelchairAccessible?: boolean;
}
```

### Feedback Collection
```typescript
{
  userId: ObjectId;
  resourceId: ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Firebase project
- Expo CLI
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   PORT=4000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   Update `src/firebase/firebase.ts` with your Firebase configuration

4. **Start development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## 📦 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run dev:all` - Start both backend and frontend
- `npm run expo` - Start Expo development server

### Frontend Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Resources
- `GET /api/resources` - Get all resources with filters
- `GET /api/resources/:id` - Get specific resource
- `POST /api/resources` - Create new resource (admin)
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/:resourceId` - Get feedback for resource
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Firebase Integration**: Google Firebase authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers and protection
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API rate limiting (configurable)

## 📱 Mobile App Configuration

### Permissions
- **Location**: Fine and coarse location access
- **Camera**: For profile pictures (if implemented)
- **Microphone**: For voice search functionality

### Platform Support
- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 11.0+
- **Web**: Modern browsers with PWA support

## 🎨 Theming and UI

### Theme System
- **Dark/Light Mode**: Automatic system theme detection
- **Custom Colors**: Brand-specific color palette
- **Typography**: Google Fonts integration
- **Responsive Design**: Adaptive layouts for different screen sizes

### Internationalization
- **Multi-language Support**: English and other languages
- **Dynamic Language Switching**: Runtime language changes
- **RTL Support**: Right-to-left language support

## 🗺️ Maps and Location

### Google Maps Integration
- **Interactive Maps**: Touch and zoom functionality
- **Location Markers**: Custom markers for healthcare facilities
- **Directions**: Navigation to selected facilities
- **Geospatial Queries**: MongoDB 2dsphere indexing

### Location Features
- **Current Location**: GPS-based location detection
- **Location Permissions**: Graceful permission handling
- **Offline Maps**: Cached map data for offline use

## 📊 Performance Optimizations

### Backend
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis caching (if implemented)
- **Compression**: Gzip compression for API responses

### Frontend
- **Lazy Loading**: Component and screen lazy loading
- **Image Optimization**: Optimized image loading
- **Bundle Splitting**: Code splitting for smaller bundles
- **Memory Management**: Efficient state management

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB integration testing

### Frontend Testing
- **Component Tests**: React component testing
- **Navigation Tests**: Screen navigation testing
- **E2E Tests**: End-to-end user flow testing

## 🚀 Deployment

### Backend Deployment
- **Production Build**: `npm run build`
- **Environment Variables**: Production configuration
- **Database**: MongoDB Atlas production cluster
- **Hosting**: Heroku, AWS, or similar platform

### Frontend Deployment
- **Expo Build**: `expo build`
- **App Stores**: Google Play Store and Apple App Store
- **OTA Updates**: Expo Updates for over-the-air updates

## 📈 Monitoring and Analytics

### Backend Monitoring
- **Logging**: Morgan HTTP request logging
- **Error Tracking**: Centralized error logging
- **Performance**: API response time monitoring

### Frontend Analytics
- **User Analytics**: User behavior tracking
- **Crash Reporting**: Error and crash reporting
- **Performance**: App performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v0.1.0** - Development version with basic features

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications for nearby emergencies
- [ ] Telemedicine integration
- [ ] Appointment booking system
- [ ] Health records integration
- [ ] Community health forums
- [ ] Emergency contact system
- [ ] Health tips and articles
- [ ] Medication reminders

### Technical Improvements
- [ ] Advanced caching strategies
- [ ] Real-time updates with WebSockets
- [ ] Machine learning for personalized recommendations
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant architecture
- [ ] Microservices migration

---

**JeevanPath** - Connecting people to healthcare resources, one location at a time. 🏥📍

# JeevanPath - Healthcare Resource Locator

JeevanPath is a comprehensive healthcare resource locator application that helps users find nearby medical facilities, pharmacies, and blood banks. The application features a React Native frontend with Expo and a Node.js/Express backend with MongoDB.

## 🏗️ Project Architecture

```
jeevan_path/
├── backend/          # Node.js/Express API server
├── frontend/         # React Native/Expo mobile application
└── README.md         # This file
```

## 🚀 Features

### Core Functionality
- **Location-based Search**: Find healthcare resources near your location
- **Multi-language Support**: Internationalization with i18next
- **Voice Search**: Voice-activated search capabilities
- **Offline Support**: Works without internet connection
- **Real-time Maps**: Interactive maps with Google Maps integration
- **User Authentication**: Firebase-based authentication system
- **Feedback System**: Rate and review healthcare facilities

### Resource Types
- **Clinics**: Medical clinics and healthcare centers
- **Pharmacies**: Medicine and pharmaceutical stores
- **Blood Banks**: Blood donation and storage facilities

### Advanced Features
- **Smart Filtering**: Filter by type, rating, services, languages, insurance, accessibility
- **Accessibility Support**: Wheelchair accessibility information
- **Transportation Options**: Public transit, walking distance, parking information
- **Dark/Light Theme**: Adaptive theming system
- **Device Management**: Multi-device user support

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK + JWT
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Zod
- **Development**: ts-node-dev, Morgan logging

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Jotai
- **Maps**: React Native Maps
- **Authentication**: Firebase
- **Internationalization**: i18next
- **UI Components**: Expo Vector Icons
- **Fonts**: Google Fonts (Inter, Poppins, JetBrains Mono)

### Database
- **Primary Database**: MongoDB Atlas
- **Connection**: Mongoose ODM
- **Geospatial Indexing**: 2dsphere for location queries

## 📱 Mobile App Features

### Screens
- **Splash Screen**: App initialization and loading
- **Login Screen**: Firebase authentication
- **OTP Screen**: Phone number verification
- **Home Screen**: Main search interface
- **Search Screen**: Advanced search with filters
- **Map Results Screen**: Interactive map view
- **Resource Details Screen**: Detailed facility information
- **Settings Screen**: App preferences and language settings
- **Voice Chat Screen**: Voice-activated search
- **Offline Screen**: Offline mode indicator
- **Location Permission Screen**: Location access setup

### Navigation
- **Root Navigator**: Main navigation container
- **Tabs Navigator**: Bottom tab navigation
- **Stack Navigation**: Screen transitions

## 🔧 Backend API

### Models
- **User**: User profiles with device management
- **Resource**: Healthcare facilities with geospatial data
- **Feedback**: User ratings and reviews

### Controllers
- **Users**: User management and authentication
- **Resources**: Healthcare facility CRUD operations
- **Feedback**: Rating and review management
- **Settings**: User preferences

### Routes
- `/api/users` - User management
- `/api/resources` - Healthcare resources
- `/api/feedback` - Ratings and reviews
- `/api/settings` - User settings

### Middleware
- **Authentication**: JWT token validation
- **CORS**: Cross-origin resource sharing
- **Security**: Helmet for security headers
- **Logging**: Morgan request logging

## 🗄️ Database Schema

### User Collection
```typescript
{
  firebaseUid: string;
  name?: string;
  phone?: string;
  language?: string;
  devices: DeviceInfo[];
  createdAt: Date;
}
```

### Resource Collection
```typescript
{
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood';
  address?: string;
  contact?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  openTime?: string;
  closeTime?: string;
  rating?: number;
  services?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  transportation?: string[];
  wheelchairAccessible?: boolean;
}
```

### Feedback Collection
```typescript
{
  userId: ObjectId;
  resourceId: ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Firebase project
- Expo CLI
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   PORT=4000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   Update `src/firebase/firebase.ts` with your Firebase configuration

4. **Start development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## 📦 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run dev:all` - Start both backend and frontend
- `npm run expo` - Start Expo development server

### Frontend Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Resources
- `GET /api/resources` - Get all resources with filters
- `GET /api/resources/:id` - Get specific resource
- `POST /api/resources` - Create new resource (admin)
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/:resourceId` - Get feedback for resource
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Firebase Integration**: Google Firebase authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers and protection
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API rate limiting (configurable)

## 📱 Mobile App Configuration

### Permissions
- **Location**: Fine and coarse location access
- **Camera**: For profile pictures (if implemented)
- **Microphone**: For voice search functionality

### Platform Support
- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 11.0+
- **Web**: Modern browsers with PWA support

## 🎨 Theming and UI

### Theme System
- **Dark/Light Mode**: Automatic system theme detection
- **Custom Colors**: Brand-specific color palette
- **Typography**: Google Fonts integration
- **Responsive Design**: Adaptive layouts for different screen sizes

### Internationalization
- **Multi-language Support**: English and other languages
- **Dynamic Language Switching**: Runtime language changes
- **RTL Support**: Right-to-left language support

## 🗺️ Maps and Location

### Google Maps Integration
- **Interactive Maps**: Touch and zoom functionality
- **Location Markers**: Custom markers for healthcare facilities
- **Directions**: Navigation to selected facilities
- **Geospatial Queries**: MongoDB 2dsphere indexing

### Location Features
- **Current Location**: GPS-based location detection
- **Location Permissions**: Graceful permission handling
- **Offline Maps**: Cached map data for offline use

## 📊 Performance Optimizations

### Backend
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis caching (if implemented)
- **Compression**: Gzip compression for API responses

### Frontend
- **Lazy Loading**: Component and screen lazy loading
- **Image Optimization**: Optimized image loading
- **Bundle Splitting**: Code splitting for smaller bundles
- **Memory Management**: Efficient state management

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB integration testing

### Frontend Testing
- **Component Tests**: React component testing
- **Navigation Tests**: Screen navigation testing
- **E2E Tests**: End-to-end user flow testing

## 🚀 Deployment

### Backend Deployment
- **Production Build**: `npm run build`
- **Environment Variables**: Production configuration
- **Database**: MongoDB Atlas production cluster
- **Hosting**: Heroku, AWS, or similar platform

### Frontend Deployment
- **Expo Build**: `expo build`
- **App Stores**: Google Play Store and Apple App Store
- **OTA Updates**: Expo Updates for over-the-air updates

## 📈 Monitoring and Analytics

### Backend Monitoring
- **Logging**: Morgan HTTP request logging
- **Error Tracking**: Centralized error logging
- **Performance**: API response time monitoring

### Frontend Analytics
- **User Analytics**: User behavior tracking
- **Crash Reporting**: Error and crash reporting
- **Performance**: App performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v0.1.0** - Development version with basic features

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications for nearby emergencies
- [ ] Telemedicine integration
- [ ] Appointment booking system
- [ ] Health records integration
- [ ] Community health forums
- [ ] Emergency contact system
- [ ] Health tips and articles
- [ ] Medication reminders

### Technical Improvements
- [ ] Advanced caching strategies
- [ ] Real-time updates with WebSockets
- [ ] Machine learning for personalized recommendations
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant architecture
- [ ] Microservices migration

---

**JeevanPath** - Connecting people to healthcare resources, one location at a time. 🏥📍
