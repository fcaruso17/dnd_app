# D&D Digital Character Sheet

Welcome to your new premium, fully-digital alternative to the 3-page physical Dungeons & Dragons Character Sheet!

Built as a modern React application, this project is designed to be highly interactive, portable, and completely backend-free, allowing you to seamlessly manage your campaigns from any device.

## Core Features

- **Premium Dark Fantasy Interface**: Styled natively using vanilla CSS with a sleek dark mode, glassmorphism layouts, and immersive typography.
- **Multiclassing Support (Official 5e Mechanics)**: Add an array of classes and the application automatically recalculates your **Total Character Level** and **Proficiency Bonus**. You can cleanly pool multiple hit dice and manage separate spell save DCs for each class!
- **D&D 5e API Integration**: Fully synced with `dnd5eapi.co`. Search for weapons or spells and instantly pull official damage dice, casting times, ranges, and lengthy spell descriptions directly into your character sheet.
- **Auto-Save via Local Storage**: Every keystroke, HP adjustment, or expended spell slot is automatically saved to your browser locally. Close your tab and come back right where you left off.
- **Portability (Export / Import JSON)**: Easily share your character with your Dungeon Master or friends! Click "Export .json" to backup your entire sheet, and use "Import" to seamlessly load it up on another machine. 
- **Native Image Uploading**: Upload a custom character portrait directly from your computer. The image is saved reliably without needing to host it on an obscure file-server.

## How It Works

This is a traditional Single-Page Application constructed with **React** and bundled using **Vite**. 

All data is managed globally via standard React Context logic, which continuously serializes your character's state to your `window.localStorage`. This provides a zero-latency, zero-cost, persistent experience without ever needing to setup a cloud database or a backend server.

The D&D API connection utilizes a lightweight caching service to ensure you securely and softly ping their servers without spamming duplicate requests when searching.

## Quick Start (Local Setup)

1. Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. In the terminal, navigate to the `dnd_app` directory.
3. If you haven't already, install the dependencies with:
   ```bash
   npm install
   ```
4. Start the local Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173` to start playing!
6. When you are finished with your session, return to the terminal where you ran `npm run dev` and press `Ctrl + C` on your keyboard to gracefully close the local server.
