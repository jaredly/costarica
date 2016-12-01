// @flow
import React, { Component } from 'react';
import {css, StyleSheet} from 'aphrodite'

import type {StateT} from '../server/types'
import {init} from '../server/game-state'

import GameT from './Game'
import PreGameT from './PreGame'

class App extends Component {
  props: {
  }

  state: {
    gameState: StateT,
  }

  constructor() {
    super()
    this.state = {
      gameState: init(),
    }
    ws.on('state', evt => {
      const state = JSON.parse(evt.data)
      this.setState({gameState: state})
    })
    ws.send('init')
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
