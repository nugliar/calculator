import React from 'react'
import { Display } from './Display'
import { Buttons } from './Buttons'
import { FormulaDisplay } from './FormulaDisplay'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className='outer-container'>
        <div className='calculator'>
          <div className='description'>
            <p>Formula Calculator</p>
          </div>
          <FormulaDisplay />
          <Display />
          <Buttons />
        </div>
      </div>
    </div>
  );
}

export default App;
