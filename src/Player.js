// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {PlayerT, TurnStatusT} from './server/types'

import consts from './server/consts'
import BuildingTile from './BuildingTile'

export default class Player extends Component {
  props: {
    player: PlayerT,
    isMe: boolean,
    myTurn: boolean,
    actions: {},
    turnStatus: TurnStatusT,
  }

  render() {
    const {player, isMe, myTurn, actions, turnStatus} = this.props
    // TODO playerisland, playercity
    return <div className={css(styles.container)}>
      <div className={css(isMe && styles.itMe)}>
        {player.name} ({player.id}) {isMe ? '[me]' : ''}
      </div>
      <div>
        Dubloons: {player.dubloons}
      </div>
      <PlayerBuildings
        player={player}
        turnStatus={turnStatus}
        actions={actions}
      />
    </div>
  }
}

class PlayerBuildings extends Component {
  state: {
    inhabitants: Object
  }
  constructor(props) {
    super()
    this.state = {
      inhabitants: {},
    }
  }

  render() {
    const {player, actions, turnStatus} = this.props
    const isSettling = turnStatus.currentRole === 'mayor' && turnStatus.turn === player.id

    return <div className={css(styles.buildings)}>
      {player.city.map((building, i) => (
        <BuildingTile
          key={building.type}
          type={building.type}
          inhabitants={building.inhabitants}
          onInhabit={
            // isSettling &&
            null
          }
        />
      ))}
    </div>
  }
}

const styles = StyleSheet.create({
  itMe: {
    backgroundColor: '#aef'
  }
})
