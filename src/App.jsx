import "./App.css";
import FireStationInfo from "./components/FireStationInfo";
import FireStationRegister from "./components/FirestationRegister";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FireStationInfo />} />
      <Route path="/register" element={<FireStationRegister />} />
    </Routes>
  );
}

export default App;
