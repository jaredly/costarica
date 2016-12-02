// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {BankT, TurnStatusT, PlayerT} from './server/types'
import consts from './server/consts'

import BuildingTile from './BuildingTile'

const keys = <K, V>(object: {[key: K]: V}): Array<K> => {
  let x: Array<any> = Object.keys(object)
  return x
}

const buildingColumns = [[], [], [], []]
Object.keys(consts.buildings).forEach(
  key => buildingColumns[consts.buildings[key].col - 1].push(consts.buildings[key]))

export default class Bank extends Component {
  props: {
    bank: BankT,
    actions: any,
    myTurn: boolean,
    turnStatus: TurnStatusT,
    player: PlayerT,
  }

  render() {
    const {bank, actions, myTurn, turnStatus, player} = this.props
    const amBuilding = myTurn && turnStatus.currentRole === 'builder'
    const spotsFilled = amBuilding ? player.city.reduce((n, b) => n + consts.buildings[b.type].size, 0) : 0
    return <div className={css(styles.container)}>
      Bank<br/>
      Quarries: {bank.quarriesLeft}<br/>
      Goods: some
      plantations: some
      colonistsLeft: {bank.colonistsLeft}<br/>
      buildingsLeft: some
      <div className={css(styles.buildings)}>
        {buildingColumns.map((col, i) => (
          <div key={i} className={css(styles.buildingColumn)}>
            {col.map(building => <BuildingTile
              onTake={(
                amBuilding
                && !player.buildings[building.type] // can only have one of a kind
                && building.size + spotsFilled <= 12
                && bank.buildingsLeft[building.type] > 0
                && building.cost <= player.dubloons
              ) ? () => this.props.actions.build(building.type) : undefined}
              key={building.type}
              type={building.type}
              inhabitants={0}
              available={bank.buildingsLeft[building.type]}
            />)}
          </div>
        ))}
      </div>
    </div>
  }
}

const styles = StyleSheet.create({
  container: {

  },

  buildings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
})
