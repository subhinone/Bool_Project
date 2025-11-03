import "./App.css";
import FireStationInfo from "./components/FireStationInfo";
import FireStationRegister from "./components/FirestationRegister";
import Login from "./components/Login";
import DashBoard from "./components/DashBoard";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FireStationInfo />} />
      <Route path="/register" element={<FireStationRegister />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashBoard />} />
    </Routes>
  );
}

export default App;
