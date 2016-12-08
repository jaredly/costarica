// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {BankT, TurnStatusT, PlayerT} from './server/types'
import consts from './server/consts'
import utils from './server/utils'
import * as sharedStyles from './styles'

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
    return <div className={css(styles.container)}>
      <div style={{flexDirection: 'row'}}>
        quarries: {bank.quarriesLeft} &nbsp;
        colonists: {bank.colonistsLeft}<br/>
      </div>
      <div className={css(styles.goods)}>
      {Object.keys(bank.goods).map((good: any) => (
        bank.goods[good] ?
          renderGood(good, bank.goods[good])
          : 'No ' + good
      ))}
      </div>
      <div className={css(styles.buildings)}>
        {buildingColumns.map((col, i) => (
          <div key={i} className={css(styles.buildingColumn)}>
            {col.map(building => <BuildingTile
              onTake={(
                amBuilding
                && !player.buildings[building.type] // can only have one of a kind
                && building.size + player.citySize <= 12
                && bank.buildingsLeft[building.type] > 0
                && utils.costOfBuilding(building, player, turnStatus.phase === player.id) <= player.dubloons
              ) ? () => this.props.actions.build(building.type) : undefined}
              key={building.type}
              type={building.type}
              cost={utils.costOfBuilding(building, player, amBuilding && turnStatus.phase === player.id)}
              inhabitants={0}
              available={bank.buildingsLeft[building.type]}
            />)}
          </div>
        ))}
      </div>
    </div>
  }
}

const renderGood = (good, count) => {
  const res = []
  for (let i=0; i<count; i++) {
    res.push(<div
      key={i}
      style={{backgroundColor: sharedStyles.colors[good]}}
      className={css(styles.good)}
    />)
  }
  return <div className={css(styles.goodRow)}>
    <div className={css(styles.goodCount)}>
      {count}
    </div>
    {res}
  </div>
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
  },

  good: sharedStyles.good,

  goodCount: {
    marginRight: 10,
  },

  goodRow: {
    flexDirection: 'row',
  },

  buildings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
})
