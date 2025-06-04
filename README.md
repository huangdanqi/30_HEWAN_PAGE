# Hewan Page - Hotel Management System

A modern hotel management system built with Vue 3, TypeScript, and Ant Design Vue.

## Features

- **Login System**: Secure authentication system
- **Account Management**: Track income, expenses, and financial transactions
- **Product Management**: Manage hotel products and services
- **OTA Integration**: Manage listings across multiple Online Travel Agencies (Booking.com, Expedia, Agoda, Airbnb)

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Ant Design Vue 4.x
- Vue Router 4
- Pinia (State Management)
- Axios (API Client)

## Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── layouts/         # Layout components
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── views/           # Page components
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## API Integration

The application is configured to connect to a backend API running on `http://localhost:8080`. The API endpoints are proxied through `/api` in development.

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Access the application at `http://localhost:3000`

## Building for Production

1. Run `npm run build` to create a production build
2. The built files will be in the `dist` directory
3. Deploy the contents of the `dist` directory to your web server

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
