// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {PlayerT} from '../server/types'

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
      <div>
        {player.name} ({player.id})
      </div>
      <div>
        {player.dubloons}
      </div>
    </div>
  }
}

const styles = StyleSheet.create({

})
