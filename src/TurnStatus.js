// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {TurnStatusT, PlayerT} from './server/types'

export default class TurnStatus extends Component {
  props: {
    pid: number,
    players: Array<PlayerT>,
    turnStatus: TurnStatusT,
  }

  render() {
    const {turnStatus, players, pid} = this.props
    return <div>
      <div>
        Governor: {players[turnStatus.governor].name}
      </div>
      <div>
        Current Phase: {turnStatus.currentRole}
      </div>
      <div>
        Phase Leader: {players[turnStatus.phase].name}
      </div>
      <div>
        Turn: {players[turnStatus.turn].name}
      </div>
    </div>
  }
}
