import './App.css';
import Home from './pages/HomePage'
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <div>
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>

    </div>
  );
}

export default App;
