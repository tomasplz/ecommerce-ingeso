import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import AdminList from "./pages/AdminList";
import "./App.css";

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/about" className="nav-link">Sobre Nosotros</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/admin-panel" className="nav-link">Admin Panel</Link>
        <Link to="/admin-list" className="nav-link">Admin List</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/admin-list" element={<AdminList />} />
      </Routes>
    </Router>
  );
}

export default App;
