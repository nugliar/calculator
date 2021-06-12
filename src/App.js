import React from 'react'
import { Display } from './Display'
import { Buttons } from './Buttons'
import { FormulaDisplay } from './FormulaDisplay'
import githubIcon from './img/GitHub-Mark-64px.png'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className='outer-container'>
        <div className='calculator'>
          <div className='description'>
            <a className='link' href='https://github.com/nugliar/calculator'>
              <img src={githubIcon} alt='git' />
            </a>
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
