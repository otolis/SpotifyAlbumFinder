
import './App.css'
import { FormControl, InputGroup, Container, Button } from "react-bootstrap";
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
console.log("Client ID:", clientId);
console.log("Client Secret:", clientSecret);

function App() {
  return (
    <>
      <Container>
        <InputGroup>
          <FormControl
            placeholder="Search For Artist"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={() => {}} 
            onChange={() => {}} 
            style={{
              width: "300px",
              height: "35px",
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />

          <Button onClick={() => {}}>Search</Button>
        </InputGroup>
      </Container>
    </>
  );
}
export default App
