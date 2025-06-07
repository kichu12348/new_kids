# Kids Art Studio

A fun and interactive drawing app for kids to practice their artistic skills and get feedback on their drawings.

## Features

- 🎨 Interactive drawing canvas
- 🌈 Multiple color options
- ✏️ Different brush sizes
- 🔄 Real-time drawing feedback
- 🎯 Word-based drawing challenges
- 📱 Works on both mobile and web platforms

## Required Assets

Please copy the following files from the original project to make the UI work:

From `/e:/zenturio/Vocabulary/kid3/kid3/assets/images/` to your project's `assets/images/`:
- b3.jpg (background image)
- zenturiotech-logo.png (footer logo)
- adaptive-icon.png (Android icon)
- favicon.png (web favicon)
- icon.png (app icon)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your preferred platform:
- Web: Press `w` in the terminal
- Android: Press `a` in the terminal
- iOS: Press `i` in the terminal

## Backend Requirements

The app expects a backend server running at `http://127.0.0.1:8000` with the following endpoints:

- `/random_word/` - GET request to fetch a random word
- `/predict/` - POST request to submit drawings for prediction

Make sure the backend server is running before using the app.

## Project Structure

```
.
├── app/
│   ├── _layout.jsx       # App layout and navigation
│   ├── index.jsx         # Home screen
│   ├── draw.jsx          # Drawing screen
│   ├── result.jsx        # Result screen
│   └── WebCanvasDraw.jsx # Web-specific drawing component
├── assets/
│   ├── images/          # App images and icons
│   ├── fonts/           # Custom fonts
│   └── sounds/          # Sound effects
└── package.json         # Project dependencies
```

## Tech Stack

- React Native
- Expo
- React Navigation
- Expo Router
- React Native SVG
- React Native Canvas
- Linear Gradient
- ViewShot 