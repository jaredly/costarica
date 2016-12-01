// @flow
import React, { Component } from 'react';
import {css, StyleSheet} from 'aphrodite'

import type {EmptyGameT, StateT} from './server/types'

import Game from './Game'
import PreGame from './PreGame'

class App extends Component {
  props: {
    actions: any,
  }

  state: {
    gameState: StateT,
  }

  constructor() {
    super()
    this.state = {
      gameState: {status: 'not-loaded'}
    }
    this.props.actions.addStateListener(gameState => this.setState({gameState}))
    this.props.actions.init()
  }

  renderBody() {
    const {gameState} = this.state
    if (gameState.status === 'not-loaded') {
      return <div>Loading...</div>
    }
    if (gameState.status === 'waiting') {
      return <PreGame preGame={gameState} actions={this.props.actions} />
    }
    return <Game game={gameState} actions={this.props.actions} />
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
