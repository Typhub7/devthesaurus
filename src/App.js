import React from 'react';
import './App.css';
import Graph from './Graph';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-3xl">Dictionnaire des Développeurs</h1>
      </header>
      <main className="p-4">
        <Graph />
      </main>
    </div>
  );
}

export default App;