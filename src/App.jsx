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

  // 4. Hero Animation
  useEffect(() => {
    if (albums.length === 0 && anime) {
      anime({ targets: '.hero-title', opacity: [0, 1], translateY: [-20, 0], duration: 1000, delay: 200, easing: 'easeOutExpo' });
      anime({ targets: '.vis-bar', height: ['20px', '100px'], duration: 400, direction: 'alternate', loop: true, delay: anime.stagger(100), easing: 'easeInOutSine' });
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
      // Temporarily remove CSS transition so Shake works instantly
      pillElement.style.transition = 'none';

      anime({
        targets: pillElement,
        translateX: [-15, 15, -15, 15, 0], 
        boxShadow: [
          '0 8px 20px rgba(0,0,0,0.3)', 
          '0 8px 20px rgba(255,0,0,0.8)', // Red Flash
          '0 8px 20px rgba(0,0,0,0.3)'
        ],
        easing: "easeInOutSine",
        duration: 400,
        complete: () => {
          // Restore CSS transition for smooth hover effects
          pillElement.style.transition = ''; 
        }
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

      {/* --- SEARCH SECTION --- */}
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

      {/* --- HERO SECTION --- */}
      {albums.length === 0 && (
        <Container className="hero-container">
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