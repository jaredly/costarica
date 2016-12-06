// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {BoardT, TurnStatusT, CargoShipT, PlayerT, BankT} from './server/types'
import consts from './server/consts'
import * as sharedStyles from './styles'
import utils from './server/utils'
import PlantationTile from './PlantationTile'
import PileOfCoins from './PileOfCoins'

export default class Board extends Component {
  props: {
    turnStatus: TurnStatusT,
    player: PlayerT,
    actions: any,
    board: BoardT,
    bank: BankT,
  }

  render() {
    const {board, player, turnStatus, actions, bank} = this.props
    const isPicking = turnStatus.currentRole === 'settler' && turnStatus.turn === player.id
    const canExtra = isPicking && player.occupiedBuildings.hacienda && !turnStatus.usedHacienda
    const canQuarry = isPicking && utils.canTakeQuarry(bank, turnStatus, player)
    return <div className={css(styles.container)}>
      <div className={css(styles.plantations)}>
          <PlantationTile
            onTake={isPicking ? () => actions.settleRandom() : undefined}
            type={'random'}
          />
        {board.revealedPlantations.map((type, i) => (
          <PlantationTile
            key={i}
            onTake={isPicking ? () => actions.settleRevealed(i) : undefined}
            type={type}
          />
        ))}
        <PlantationTile
          onTake={canQuarry ?
            () => actions.settleQuarry() : undefined}
          type='quarry'
          title={`quarry (${bank.quarriesLeft} left)`}
        />
        {canExtra && <PlantationTile
          onTake={() => actions.settleExtra()}
          title={'Use Hacienda'}
          type='random'
          // className={css(styles.plantation, styles.plantationQuarry, styles.plantationActive)}
        />}
      </div>
      <RolePicker
        usedRoles={board.usedRoles}
        currentRole={turnStatus.currentRole}
        roleRewards={board.roleRewards}
        canPick={player.id === turnStatus.turn && player.id === turnStatus.phase && !turnStatus.currentRole}
        onPick={role => actions.pickRole(role)}
      />
      <div style={{flexDirection: 'row'}}>
        <TradingHouse tradingHouse={board.tradingHouse} />
        {board.cargoShips.map((ship, i) => (
          <Ship ship={ship} key={i} />
        ))}
      </div>
    </div>
  }
}

const TradingHouse = ({tradingHouse}) => {
  const items = []
  for (let i=0; i<4; i++) {
    if (tradingHouse.length > i) {
      items.push(<div key={i} className={css(styles.tradingGood)} style={{
        backgroundColor: sharedStyles.colors[tradingHouse[i]]
      }}/>)
    } else {
      items.push(<div key={i} className={css(styles.tradingEmpty)} />)
    }
  }

  return <div className={css(styles.tradingHouse)}>
    Trading House
    <div className={css(styles.tradingItems)}>
      {items}
    </div>
  </div>
}

const Ship = ({ship}: {ship: CargoShipT}) => {
  const items = []
  for (let i=0; i<ship.size; i++) {
    if (i < ship.occupied) {
      items.push(<div key={i} className={css(styles.good)} style={{
        backgroundColor: sharedStyles.colors[ship.good],
      }} />)
    } else {
      items.push(<div key={i} className={css(styles.good)} style={{
        backgroundColor: 'transparent',
      }} />)
    }
  }
  return <div className={css(styles.cargoShip)}>
    Ship
    <div className={css(styles.shipCargo)}>
      {items}
    </div>
  </div>
}

const RolePicker = ({usedRoles, canPick, roleRewards, onPick, currentRole}) => (
  <div className={css(styles.roles)}>
    {Object.keys(consts.roles).map(role => (
      <div
        key={role}
        onClick={canPick && usedRoles.indexOf(role) === -1 ? () => onPick(role) : null}
        className={css(
          styles.role,
          canPick && usedRoles.indexOf(role) === -1 && styles.roleClickable,
          role === currentRole && styles.currentRole,
        )}
      >
        {roleRewards[role] ? <PileOfCoins count={roleRewards[role]} /> : null}
        <div className={css(styles.roleTitle)}>
          {role}
        </div>
      </div>
    ))}
  </div>
)

const styles = StyleSheet.create({
  roles: {
    flexDirection: 'row'
  },
  role: {
    padding: '5px 10px',
    height: 120,
    width: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
    // border: '1px solid',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    margin: 10,
  },

  tradingItems: {
    width: 100,
    height: 100,
    border: '1px solid #ccc',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  tradingGood: {
    width: 49,
    height: 49,
    border: '1px solid #ccc',
  },

  tradingEmpty: {
    width: 49,
    height: 49,
    border: '1px solid #ccc',
  },

  plantations: {
    flexDirection: 'row',
  },

  plantationQuarry: {
    backgroundColor: '#555',
    color: 'white',
  },

  space: sharedStyles.space,
  spaceFilled: sharedStyles.spaceFilled,

  roleClickable: {
    cursor: 'pointer',
    outline: '5px solid magenta',
    borderColor: 'magenta',
    ':hover': {
      backgroundColor: '#eee',
    }
  },

  currentRole: {
    outline: '3px solid #aef',
    borderColor: '#aef',
  },

  cargoShip: {
    alignItems: 'center',
    padding: 10,
    border: '1px solid #ccc',
    marginLeft: 5,
  },

  shipCargo: {
    width: 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },

  good: sharedStyles.good,

  roleTitle: {
    marginBottom: 10,
  },
})
