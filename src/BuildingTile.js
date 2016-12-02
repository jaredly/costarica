// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {BuildingType} from './server/consts'
import {buildings} from './server/consts'

type Props = {
  type: BuildingType,
  inhabitants: number,
  available: ?number,
  onTake?: () => void,
  onInhabit?: () => void,
}

const makeInhabitants = (spaces, filled) => {
  const res = []
  for (var i=0; i<spaces; i++) {
    res.push(<div
      key={i}
      className={css(styles.space, i < filled && styles.spaceFilled)}
    />)
  }
  return res
}

const fake: any = {}
const colors = {
  ...fake,
  violet: '#fdf',
  indigo: '#ddf',
  tobacco: '#fea',
  coffee: '#ccc',
  sugar: 'white',
  corn: '#faf',
}

const colorForType = type => {
  if (type === 'smallIndigo') return colors.indigo
  if (type === 'smallSugar') return colors.sugar
  return colors[type] || colors.violet
}

export default ({type, inhabitants, available, onTake, onInhabit}: Props) => (
  <div
    onClick={onTake}
    className={css(styles.container, onTake && styles.clickable)}
    style={{backgroundColor: colorForType(type)}}
  >
    <div className={css(styles.top)}>
      <div className={css(styles.vp)}>{buildings[type].col}</div>
      <div className={css(styles.name, onTake && styles.selectableName)}>{type}</div>
      <div className={css(styles.cost)}>{buildings[type].cost}</div>
    </div>
    <div className={css(styles.bonus)}>
      {buildings[type].bonus}
    </div>
    <div style={{flex: 1}}/>
    <div className={css(styles.top, onInhabit && styles.clickable)} onClick={onInhabit}>
      <div className={css(styles.inhabitants)}>
        {makeInhabitants(buildings[type].spaces, inhabitants)}
      </div>
      {available != null &&
        <div className={css(styles.available)}>
          {available}
        </div>}
    </div>
  </div>
)

const styles = StyleSheet.create({
  container: {
    width: 170,
    height: 90,
    border: '1px solid #ccc',
    padding: '5px 10px 10px',
    margin: 3,
  },

  clickable: {
    cursor: 'pointer',
  },

  name: {
    fontSize: 12,
    alignItems: 'center',
    fontWeight: 'bold',
    padding: '3px 5px',
    border: '1px solid transparent',
  },

  selectableName: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: 'black',
  },

  tall: {
    height: 150,
  },

  top: {
    fontSize: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  vp: {
    color: 'magenta',
    fontWeight: 'bold',
  },

  cost: {
    color: '#555',
    backgroundColor: '#ffa',
    padding: '2px 4px',
    borderRadius: 10,
  },

  bonus: {
    fontSize: 8,
    padding: 10,
    lineHeight: 1.2,
  },

  inhabitants: {
    flexDirection: 'row',
    flex: 1,
  },

  space: {
    backgroundColor: 'white',
    width: 20,
    height: 20,
    marginRight: 2,
    borderRadius: 20,
    // backgroundColor: 'red',
    border: '1px solid brown',
  },

  spaceFilled: {
    backgroundColor: 'brown',
  },

  available: {
    color: '#0a5',
  },
})
