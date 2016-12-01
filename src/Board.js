// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {BoardT} from '../server/types'

export default class Board extends Component {
  props: {
    board: BoardT,
    pid: number,
  }

  render() {
    return <div className={css(styles.container)}>

    </div>
  }
}

const styles = StyleSheet.create({
})
