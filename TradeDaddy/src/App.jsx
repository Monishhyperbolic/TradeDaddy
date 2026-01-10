import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landingpage from "./Pages/Landingpage";
import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard"; // placeholder until you add it
import Reset from "./Pages/Reset";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset" element={<Reset />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
