import "./App.css";
import {
  FormControl,
  Container,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import { useState, useEffect, useRef } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const anime = window.anime;

  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  // Refs
  const gridRef = useRef(null);
  const progressRef = useRef(null);
  const topBtnRef = useRef(null);

  // 1. Initial Auth Token
  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=" + clientId + "&client_secret=" + clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  // 2. Scroll Animations
  useEffect(() => {
    const handleScroll = () => {
      if (!anime) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const percentage = (scrollPosition / totalHeight) * 100;

      if (progressRef.current) progressRef.current.style.width = `${percentage}%`;

      if (topBtnRef.current) {
        if (scrollPosition > 300) {
          if (topBtnRef.current.style.opacity === '0' || topBtnRef.current.style.opacity === '') {
            anime({ targets: topBtnRef.current, opacity: 1, scale: 1, duration: 400, easing: 'easeOutElastic(1, .6)' });
          }
        } else {
          if (topBtnRef.current.style.opacity === '1') {
            anime({ targets: topBtnRef.current, opacity: 0, scale: 0, duration: 300, easing: 'easeInQuad' });
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [anime]);

  const scrollToTop = () => {
    if (!anime) return;
    const scrollElement = document.scrollingElement || document.documentElement;
    anime({ targets: scrollElement, scrollTop: 0, duration: 1000, easing: 'easeInOutQuad' });
  };

  // 3. Staggered Entrance
  useEffect(() => {
    if (gridRef.current && albums.length > 0 && anime) {
      anime({
        targets: gridRef.current.children,
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        easing: "easeOutQuad",
      });
    }
  }, [albums, anime]);

  // 4. Hero Animation (Visualizer + LOGO DRAWING)
  useEffect(() => {
    if (albums.length === 0 && anime) {
      
      // A. Text & Bars
      anime({ targets: '.hero-title', opacity: [0, 1], translateY: [-20, 0], duration: 1000, delay: 200, easing: 'easeOutExpo' });
      anime({ targets: '.vis-bar', height: ['20px', '100px'], duration: 400, direction: 'alternate', loop: true, delay: anime.stagger(100), easing: 'easeInOutSine' });

      // B. ✨ LOGO DRAWING ANIMATION ✨
      anime({
        targets: '.spotify-path',
        strokeDashoffset: [anime.setDashoffset, 0], // The "Draw" command
        opacity: [0, 1], 
        easing: 'easeInOutSine',
        duration: 1500, 
        delay: function(el, i) { return i * 250 }, 
        direction: 'alternate', 
        loop: true 
      });
    }
  }, [albums, anime]);

  // 5. Hover Effects
  const handleMouseEnter = (e) => {
    if (anime) anime({ targets: e.currentTarget, scale: 1.05, duration: 800, easing: "easeOutElastic(1, .8)" });
  };
  const handleMouseLeave = (e) => {
    if (anime) anime({ targets: e.currentTarget, scale: 1, duration: 600, easing: "easeOutQuad" });
  };

  // 6. Shake & Search Fix
  const shakeSearch = () => {
    if (!anime) return;
    const pillElement = document.querySelector('.search-pill'); 
    
    if (pillElement) {
      pillElement.style.transition = 'none';
      anime({
        targets: pillElement,
        translateX: [-15, 15, -15, 15, 0], 
        boxShadow: ['0 8px 20px rgba(0,0,0,0.3)', '0 8px 20px rgba(255,0,0,0.8)', '0 8px 20px rgba(0,0,0,0.3)'],
        easing: "easeInOutSine",
        duration: 400,
        complete: () => { pillElement.style.transition = ''; }
      });
    }
  };

  async function search() {
    if (!searchInput) { shakeSearch(); return; }

    let artistParams = {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
    };

    try {
      const artistData = await fetch("https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist", artistParams)
        .then((result) => result.json());

      if (!artistData.artists || !artistData.artists.items.length) { shakeSearch(); return; }

      const artistID = artistData.artists.items[0].id;

      await fetch("https://api.spotify.com/v1/artists/" + artistID + "/albums?include_groups=album&market=US&limit=50", artistParams)
        .then((result) => result.json())
        .then((data) => setAlbums(data.items));
        
    } catch (error) {
      console.error("Search failed", error);
      shakeSearch();
    }
  }

  return (
    <>
      <div ref={progressRef} className="scroll-progress"></div>
      <button ref={topBtnRef} className="back-to-top" onClick={scrollToTop}>↑</button>

      {/* --- 1. TOP LOGO (Only when empty) --- */}
      {albums.length === 0 && (
        <div className="logo-container" style={{ marginTop: '50px' }}>
          <svg className="spotify-drawing-svg" viewBox="0 0 168 168">
            <path className="spotify-path" d="M84,0C37.6,0,0,37.6,0,84s37.6,84,84,84s84-37.6,84-84S130.4,0,84,0z" />
            <path className="spotify-path" d="M124.6,121.7c-1.6,2.5-4.8,3.3-7.3,1.7c-20-12.2-45.2-14.9-74.9-8.2c-2.8,0.6-5.6-1.1-6.2-3.9
              c-0.6-2.8,1.1-5.6,3.9-6.2c32.7-7.4,60.7-4.3,82.9,9.3C125.5,116,126.3,119.2,124.6,121.7z" />
            <path className="spotify-path" d="M135.2,98.6c-2.1,3.3-6.4,4.4-9.7,2.3c-22.9-14.1-57.8-18.2-84.9-10
              c-3.6,1.1-7.5-1-8.6-4.6c-1.1-3.6,1-7.5,4.6-8.6c31.1-9.4,70.2-4.8,96.3,11.2C136.2,91,137.3,95.3,135.2,98.6z" />
            <path className="spotify-path" d="M136.4,75.1c-27.4-16.3-72.7-17.8-98.9-9.8c-4.2,1.3-8.7-1.1-9.9-5.3c-1.3-4.2,1.1-8.7,5.3-9.9
              c30.8-9.3,81.1-7.6,113.1,11.4c3.8,2.2,5,7.1,2.8,10.9C146.5,76.1,141.6,77.4,136.4,75.1z" />
          </svg>
        </div>
      )}

      {/* --- 2. SEARCH BAR --- */}
      <Container className="search-container-modern">
        <div className="search-pill">
          <FormControl
            className="search-input-modern"
            placeholder="Search for an Artist..."
            type="input"
            onKeyDown={(event) => { if (event.key === "Enter") search(); }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button className="search-btn-modern" onClick={search}>Search</Button>
        </div>
      </Container>

      {/* --- 3. BOTTOM VISUALIZER (Only when empty) --- */}
      {albums.length === 0 && (
        <Container className="hero-container" style={{ minHeight: 'auto' }}>
          <h1 className="hero-title">Find Your Rhythm</h1>
          <div className="visualizer-container">
            <div className="vis-bar bar-1"></div>
            <div className="vis-bar bar-2"></div>
            <div className="vis-bar bar-3"></div>
            <div className="vis-bar bar-4"></div>
            <div className="vis-bar bar-5"></div>
          </div>
        </Container>
      )}

      {/* --- RESULTS SECTION --- */}
      <Container>
        <Row ref={gridRef} className="album-row">
          {albums.map((album) => {
            return (
              <Card
                key={album.id}
                className="album-card"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Card.Img src={album.images[0].url} className="album-img" />
                <div className="card-body">
                  <h3 className="album-title">{album.name}</h3>
                  <p className="album-date">{album.release_date}</p>
                  <a href={album.external_urls.spotify} className="album-btn" target="_blank" rel="noreferrer">
                    Listen Now
                  </a>
                </div>
              </Card>
            );
          })}
        </Row>
      </Container>
    </>
  );
}

export default App;