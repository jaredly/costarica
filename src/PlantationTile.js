// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {IslandSquare, IslandType} from './server/types'
import type {Good} from './server/consts'
import * as sharedStyles from './styles'

type Props = {
  onInhabit?: Function,
  inhabited?: boolean,
  type: IslandType | 'random',
  title?: string,
  onTake?: Function,
}

export default ({type, title, onTake, onInhabit, inhabited}: Props) => (
  <div className={css(styles.plantation, onTake && styles.plantationActive)}
    onClick={onTake || onInhabit}
    style={{
      backgroundColor: sharedStyles.colors[type],
    }}
  >
    <div className={css(styles.top)}>
      {title || type}
    </div>
    <div
      className={css(styles.space, inhabited && styles.spaceFilled)}
    />
  </div>
)

const styles = StyleSheet.create({
  plantationActive: {
    cursor: 'pointer',
    borderColor: 'green',
    outline: '4px solid magenta',
  },

  top: {
    alignItems: 'center',
  },

  space: sharedStyles.space,
  spaceFilled: sharedStyles.spaceFilled,

  plantation: {
    padding: 10,
    margin: 5,
    border: '1px solid #ccc',
    width: 100,
    height: 80,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
})
