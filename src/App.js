// @flow
import React, { Component } from 'react';
import {css, StyleSheet} from 'aphrodite'

import type {State} from '../server/types'
import {init} from '../server/game-state'

import GameT from './GameT'
import PreGameT from './PreGameT'

class App extends Component {
  props: {
  }

  state: {
    gameState: State,
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
