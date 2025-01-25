import React from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Campaigns from './components/Campaigns/Campaigns.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Campaign from "./components/Campaign/Campaign.jsx";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  
  return (
    <div>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Campaigns />} />
          <Route path="/dashboard/:userAddress" element={<Dashboard />} />
          <Route path="/Campaign/:campaignAddress" element={<Campaign />} />
        </Routes>  
      </Router>
    </div>
  );
};

export default App;
