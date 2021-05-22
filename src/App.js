import React from 'react'
import { Display } from './Display'
import { Buttons } from './Buttons'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className='outer-container'>
        <div id='calculator' className='flex flex-column'>
          <Display />
          <Buttons />
        </div>
      </div>
    </div>
  );
}

export default App;
