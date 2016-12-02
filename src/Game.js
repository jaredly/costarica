// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {GameT, BankT} from './server/types'

import Board from './Board'
import Player from './Player'
import Bank from './Bank'
import TurnStatus from './TurnStatus'

const promptText = {
  settler: (player, bank: BankT, myPhase, pronoun) => {
    const canQuarry = (player.buildings.constructionHut || myPhase) && bank.quarriesLeft > 0
    if (player.buildings.hacienda) {
      if (canQuarry) {
        return `pick a plantation, and another plantation or quarry if ${pronoun} want it`
      }
      return 'pick a plantation or two'
    }
    if (canQuarry) {
      return 'pick a plantation or quarry'
    }
    return 'pick a plantation'
  },
  mayor: 'move colonists',
  /*(player, bank, myPhase) => {
    return (myPhase ? 'get two colonists' : 'get another colonist') + ' & rearrange colonists'
  },*/
  builder: 'pick a building to build',
  craftsman: 'pick an extra good',
  trader: 'trade stuff',
  captain: 'put stuff on ships',
}

const getPromptText = (game: GameT) => {
  const myTurn = game.pid === game.turnStatus.turn
  const currentPlayer = game.players[game.turnStatus.turn]
  const prefix = (myTurn ? 'Your turn to ' : `Waiting for ${currentPlayer.name} to `)
  if (!game.turnStatus.currentRole) {
    return prefix + 'pick a role'
  }
  const prompt = promptText[game.turnStatus.currentRole]
  const text = typeof prompt === 'string' ? prompt : prompt(currentPlayer, game.bank, game.turnStatus.turn === game.turnStatus.phase, myTurn ? 'you' : 'they')
  return prefix + text
}

export default class Game extends Component {
  props: {
    game: GameT,
    actions: {},
  }

  render() {
    const {actions, game} = this.props
    const myTurn = game.turnStatus.turn === game.pid
    return <div className={css(styles.container)}>
      {getPromptText(game)}
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
        turnStatus={game.turnStatus}
        player={game.players[game.pid]}
        pid={game.pid}
        bank={game.bank}
      />
      <Board
        myTurn={myTurn}
        actions={actions}
        pid={game.pid}
        board={game.board}
        turnStatus={game.turnStatus}
      />
      {game.players.map(player => (
        <Player
          key={player.id}
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
