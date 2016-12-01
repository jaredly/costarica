// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {PreGameT} from './server/types'

class JoinForm extends Component {
  state = {
    name: '',
    loading: false,
  }

  join = () => {
    this.setState({loading: true})
    this.props.onJoin(this.state.name)
  }

  render() {
    return <div >
      <input
        value={this.state.name}
        onChange={e => this.setState({name: e.target.value})}
        placeholder="Your Name"
      />
      <button disabled={this.state.loading} onClick={this.join}>
        Join!
      </button>
    </div>
  }
}

export default class PreGame extends Component {
  props: {
    preGame: PreGameT,
    actions: any,
  }

  render() {
    const myId = this.props.preGame.pid
    return <div className={css(styles.container)}>
      {myId === -1 && <JoinForm onJoin={this.props.actions.join} />}
      {this.props.preGame.waitingPlayers.map(player => (
        <div
          className={css([styles.player, player.id === myId && styles.playerMe])}
          id={player.id}>
          {player.id} : {player.name}
        </div>
      ))}
    </div>
  }
}

const styles = StyleSheet.create({
  container: {

  },

  playerMe: {
    backgroundColor: '#aef'
  }

})
