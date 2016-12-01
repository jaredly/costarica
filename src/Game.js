// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {GameT} from '../server/types'

import Board from './Board'
import Player from './Player'
import Bank from './Bank'
import TurnStatus from './TurnStatus'

class Game extends Component {
  props: {
    game: GameT,
    actions: {},
  }

  render() {
    const {actions, game} = this.props
    const myTurn = game.turnStatus.turn === game.pid
    return <div className={css(styles.container)}>
      <TurnStatus
        myTurn={myTurn}
        players={game.players}
        turnStatus={game.turnStatus}
        actions={actions}
        pid={game.pid}
      />
      <Bank
        myTurn={myTurn}
        actions={actions}
        pid={game.pid}
        bank={game.bank}
      />
      <Board
        myTurn={myTurn}
        actions={actions}
        pid={game.pid}
        board={game.board}
      />
      {game.players.map(player => (
        <Player
          myTurn={myTurn}
          player={player}
          isMe={player.id === game.pid}
          actions={actions}
        />
      ))}
    </div>
  }
}

const styles = StyleSheet.create({
})
