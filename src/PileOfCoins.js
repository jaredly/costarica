// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

export default ({count}: {count: number}) => {
  const piles = []
  for (let pile=0; pile<count/5; pile++) {
    const coins = []
    for (let i=0; i<Math.min(count - pile * 5, 5); i++) {
      coins.push(<div key={i} className={css(styles.coin)}/>)
    }
    piles.push(<div key={pile} className={css(styles.pile)}>{coins}</div>)
  }
  return <div className={css(styles.container)}>
    {piles}
  </div>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    paddingBottom: 5,
  },
  pile: {
    justifyContent: 'flex-start',
    flexDirection: 'column-reverse',
  },
  coin: {
    width: 40,
    height: 20,
    marginTop: -10,
    backgroundColor: 'gold',
    border: '3px solid #dcb138',
    borderRadius: '20px/10px',
  },
})
