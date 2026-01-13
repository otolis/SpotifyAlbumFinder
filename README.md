# Spotify Album Finder

A tool to discover and explore albums on Spotify.

## Features

- Search for albums by artist or title
- View album details and track listings

## New Features

### Visual & UI
- **Modern "Pill" Search Bar:** A floating, pill-shaped search interface with Spotify-green accents.
- **Hero Visualizer:** An animated equalizer and "Find Your Rhythm" title that appears when the app is waiting for input.
- **Dark Mode Aesthetic:** Sleek dark cards against a minimal background.

### Animations (Powered by Anime.js)
- **Staggered Entrance:** Album results cascade in one-by-one with a smooth waterfall effect.
- **Physics-Based Hover:** Album cards react with a satisfying "spring" bounce when hovered.
- **Error Shake:** The search bar shakes visually (like a head shaking "no") if a search is empty or returns no results.
- **Rainbow Scroll Progress:** A gradient progress bar at the top of the screen tracks your scrolling.
- **Pop-in Back to Top:** A floating arrow button that elastically pops onto the screen when you scroll down.

## Installation

```bash
git clone https://github.com/yourusername/SpotifyAlbumFinder.git
cd SpotifyAlbumFinder
npm install
```

## Usage

```bash
npm run dev
```

## Requirements

- Node.js 14+
- Spotify API credentials

## Configuration

Create a `.env` file with your Spotify API keys:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```
## Tech Stack
- Frontend: React, Vite

- Styling: CSS3, React Bootstrap

- Animation: Anime.js

- API: Spotify Web API

## Contributing

Pull requests welcome. Please open an issue first to discuss changes.

## License

MIT