// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {PlayerT} from './server/types'

import consts from './server/consts'

export default class Player extends Component {
  props: {
    player: PlayerT,
    isMe: boolean,
    myTurn: boolean,
    actions: {},
  }

  render() {
    const {player, isMe, myTurn, actions} = this.props
    // TODO playerisland, playercity
    return <div className={css(styles.container)}>
      <div className={css(isMe && styles.itMe)}>
        {player.name} ({player.id}) {isMe ? '[me]' : ''}
      </div>
      <div>
        Dubloons: {player.dubloons}
      </div>
      <div className={css(styles.buildings)}>
        {player.city.map((building, i) => (
          <div key={i} className={css(styles.building)}>
            {building.type} {building.inhabitants} / {consts.buildings[building.type].spaces}
          </div>
        ))}
      </div>
    </div>
  }
}

const styles = StyleSheet.create({
  itMe: {
    backgroundColor: '#aef'
  }
})
