import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import { useState, useEffect, useRef } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const anime = window.anime; // Uses CDN version

  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  
  const gridRef = useRef(null);
  const progressRef = useRef(null);
  const topBtnRef = useRef(null);

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

  // --- SCROLL ANIMATIONS (NEW) ---
  useEffect(() => {
    const handleScroll = () => {
      if (!anime) return;

      // 1. Calculate Scroll Percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const percentage = (scrollPosition / totalHeight) * 100;

      // 2. Animate Progress Bar width
      if (progressRef.current) {
        progressRef.current.style.width = `${percentage}%`;
      }

      // 3. Show/Hide Back to Top Button
      if (topBtnRef.current) {
        if (scrollPosition > 300) {
          // Show button (only if not already visible to avoid spamming)
          if (topBtnRef.current.style.opacity === '0' || topBtnRef.current.style.opacity === '') {
            anime({
              targets: topBtnRef.current,
              opacity: 1,
              scale: 1,
              duration: 400,
              easing: 'easeOutElastic(1, .6)'
            });
          }
        } else {
          // Hide button
          if (topBtnRef.current.style.opacity === '1') {
            anime({
              targets: topBtnRef.current,
              opacity: 0,
              scale: 0,
              duration: 300,
              easing: 'easeInQuad'
            });
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [anime]);

  const scrollToTop = () => {
    if (!anime) return;
    // Smooth scroll to top using Anime.js
    const scrollElement = document.scrollingElement || document.documentElement;
    anime({
      targets: scrollElement,
      scrollTop: 0,
      duration: 1000,
      easing: 'easeInOutQuad'
    });
  };

  // Staggered Entrance
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

  // Hover Effects
  const handleMouseEnter = (e) => {
    if (anime) anime({ targets: e.currentTarget, scale: 1.05, duration: 800, easing: "easeOutElastic(1, .8)" });
  };
  const handleMouseLeave = (e) => {
    if (anime) anime({ targets: e.currentTarget, scale: 1, duration: 600, easing: "easeOutQuad" });
  };

  // Force Fix for Shake
  const shakeSearch = () => {
    if (!anime) return;
    const inputElement = document.querySelector('.search-input'); 
    
    if (inputElement) {
      anime({
        targets: inputElement,
        translateX: [-10, 10, -10, 10, 0],
        filter: ['brightness(1)', 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)', 'brightness(1)'], 
        easing: "linear",
        duration: 500
      });
    }
  };

  async function search() {
    if (!searchInput) {
      shakeSearch();
      return;
    }

    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    try {
      const artistData = await fetch(
        "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
        artistParams
      ).then((result) => result.json());

      if (!artistData.artists || !artistData.artists.items.length) {
        shakeSearch();
        return;
      }

      const artistID = artistData.artists.items[0].id;

      await fetch(
        "https://api.spotify.com/v1/artists/" + artistID + "/albums?include_groups=album&market=US&limit=50",
        artistParams
      )
        .then((result) => result.json())
        .then((data) => setAlbums(data.items));
        
    } catch (error) {
      console.error("Search failed", error);
      shakeSearch();
    }
  }

  return (
    <>
      {/* 1. Progress Bar */}
      <div ref={progressRef} className="scroll-progress"></div>

      {/* 2. Back to Top Button */}
      <button ref={topBtnRef} className="back-to-top" onClick={scrollToTop}>
        ↑
      </button>

      <Container>
        <InputGroup>
          <FormControl
            className="search-input"
            placeholder="Search For Artist"
            type="input"
            onKeyDown={(event) => { if (event.key === "Enter") search(); }}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{
              width: "300px",
              height: "35px",
              border: "2px solid #ccc", 
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      <Container>
        <Row
          ref={gridRef}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center",
          }}
        >
          {albums.map((album) => {
            return (
              <Card
                key={album.id}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  backgroundColor: "white",
                  margin: "10px",
                  borderRadius: "5px",
                  marginBottom: "30px",
                  opacity: 0, 
                  cursor: "pointer",
                }}
              >
                <Card.Img width={200} src={album.images[0].url} style={{ borderRadius: "4%" }} />
                <Card.Body>
                  <Card.Title style={{ whiteSpace: "wrap", fontWeight: "bold", maxWidth: "200px", fontSize: "18px", marginTop: "10px", color: "black" }}>
                    {album.name}
                  </Card.Title>
                  <Card.Text style={{ color: "black" }}>
                    Release Date: <br /> {album.release_date}
                  </Card.Text>
                  <Button href={album.external_urls.spotify} style={{ backgroundColor: "black", color: "white", fontWeight: "bold", fontSize: "15px", borderRadius: "5px", padding: "10px" }}>
                    Album Link
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </Row>
      </Container>
    </>
  );
}

export default App;