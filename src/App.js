// @flow
import React, { Component } from 'react';
import {css, StyleSheet} from 'aphrodite'

import type {EmptyGameT, StateT} from './server/types'

import Game from './Game'
import PreGame from './PreGame'

type Props = {
  actions: any,
}

class App extends Component {
  props: Props

  state: {
    gameState: StateT,
  }

  constructor(props: Props) {
    super()
    this.state = {
      gameState: {status: 'not-loaded'}
    }
    props.actions.addStateListener(gameState => this.setState({gameState}))
    props.actions.init()
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
          <h2>Costa Rica</h2>
        </div>
        {this.renderBody()}
      </div>
    );
  }
}

export default App;
