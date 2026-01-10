import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landingpage from "./Pages/Landingpage";
import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard"; // you can create placeholder

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
