import './App.css';
import React, {useState} from 'react';
import {
  BrowserRouter as Router, 
  Routes, 
  Route} from "react-router-dom"
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route exact path='/' Component={Auth}></Route>
        <Route exact path='/dashboard' Component={Dashboard}></Route>
      </Routes>
    </Router>
    </div>
  );
}

export default App;
