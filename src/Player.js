// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {PlayerT, BankT, BoardT, TurnStatusT, BuildingTile, IslandSquare, CargoShipT} from './server/types'
import type {Good} from './server/consts'

import * as sharedStyles from './styles'
import utils from './server/utils'
import consts from './server/consts'
import BuildingTileEl from './BuildingTile'
import PlantationTile from './PlantationTile'
import PileOfCoins from './PileOfCoins'

type Props = {
  player: PlayerT,
  board: BoardT,
  isMe: boolean,
  myTurn: boolean,
  actions: any,
  bank: BankT,
  turnStatus: TurnStatusT,
}

const makeTmpColonistAllocations = player => ({
  city: player.city.map(building => ({...building})),
  island: player.island.map(land => ({...land})),
  parkedColonists: player.parkedColonists,
})

const charray = <T>(arr: Array<T>, i: number, fn: (arg: T) => T): Array<T> => {
  const res = arr.slice()
  res[i] = fn(res[i])
  return res
}

export default class Player extends Component {
  props: Props
  state: {
    tmpColonistAllocations: ?{
      city: Array<BuildingTile>,
      island: Array<IslandSquare>,
      parkedColonists: number,
    }
  }

  constructor(props: Props) {
    super()
    const isAllocating = props.turnStatus.currentRole === 'mayor' &&
        props.turnStatus.turn === props.player.id && props.isMe
    this.state = {
      tmpColonistAllocations: isAllocating ? makeTmpColonistAllocations(props.player) : null
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const isAllocating = nextProps.turnStatus.currentRole === 'mayor' &&
        nextProps.turnStatus.turn === nextProps.player.id && nextProps.isMe
    if (isAllocating) {
      this.setState({
        tmpColonistAllocations: makeTmpColonistAllocations(nextProps.player)
      })
    } else if (this.state.tmpColonistAllocations) {
      this.setState({
        tmpColonistAllocations: null
      })
    }
  }

  changeCityInhabitants = (i: number) => {
    const {tmpColonistAllocations} = this.state
    if (!tmpColonistAllocations) return
    const building = tmpColonistAllocations.city[i]
    if (
      building.inhabitants >= consts.buildings[building.type].spaces ||
      tmpColonistAllocations.parkedColonists === 0
    ) {
      this.setState({
        tmpColonistAllocations: {
          ...tmpColonistAllocations,
          parkedColonists: tmpColonistAllocations.parkedColonists + building.inhabitants,
          city: charray(tmpColonistAllocations.city, i,
            building => ({...building, inhabitants: 0})
          ),
        }
      })
    } else {
      this.setState({
        tmpColonistAllocations: {
          ...tmpColonistAllocations,
          parkedColonists: tmpColonistAllocations.parkedColonists - 1,
          city: charray(
            tmpColonistAllocations.city, i,
            building => ({...building, inhabitants: building.inhabitants + 1})
          ),
        }
      })
    }
  }

  changeIslandInhabitants = (i: number) => {
    const {tmpColonistAllocations} = this.state
    if (!tmpColonistAllocations) return
    const land = tmpColonistAllocations.island[i]
    if (
      land.inhabited || tmpColonistAllocations.parkedColonists === 0
    ) {
      this.setState({
        tmpColonistAllocations: {
          ...tmpColonistAllocations,
          parkedColonists: tmpColonistAllocations.parkedColonists + (land.inhabited ? 1 : 0),
          island: charray(tmpColonistAllocations.island, i,
            land => ({...land, inhabited: false})
          ),
        }
      })
    } else {
      this.setState({
        tmpColonistAllocations: {
          ...tmpColonistAllocations,
          parkedColonists: tmpColonistAllocations.parkedColonists - 1,
          island: charray(
            tmpColonistAllocations.island, i,
            land => ({...land, inhabited: true})
          ),
        }
      })
    }
  }

  commitAllocations = () => {
    const {tmpColonistAllocations} = this.state
    if (!tmpColonistAllocations) return
    const {parkedColonists, city, island} = tmpColonistAllocations
    this.props.actions.allocateColonists({
      parkedColonists,
      city: city.map(building => building.inhabitants),
      island: island.map(tile => tile.inhabited),
    })
  }

  renderPickingExtraGood() {
    const goodsOwed = utils.goodsOwed(this.props.player)
      // <button onClick={this.props.actions.pickExtraGood()}
    return <div>
      Pick extra good:
      {Object.keys(goodsOwed).map(good => (
        goodsOwed[good] > 0 && this.props.bank.goods[good] > 0 ?
          <div
            key={good}
            className={css(styles.extraGood)}
            onClick={() => this.props.actions.pickExtraGood(good)}
          >
            <div className={css(styles.good)} /> ({good})
          </div>
        : null
      ))}
    </div>
  }

  render() {
    const {player, board, isMe, myTurn, actions, turnStatus} = this.props
    const {tmpColonistAllocations} = this.state
    const pickingExtraGood = isMe && myTurn &&
      turnStatus.phase === player.id && turnStatus.currentRole === 'craftsman'
    const isShipping = turnStatus.currentRole === 'captain' && isMe && myTurn
    // TODO playerisland, playercity
    return <div className={css(styles.container)}>
      <div className={css(isMe && styles.itMe)}>
        {player.name} ({player.id}) {isMe ? '[me]' : ''}
      </div>
      <div>
        {player.dubloons ?
          <PileOfCoins count={player.dubloons} /> :
          'No dubloons'}
        {isMe && <span>
          {player.victoryPoints|0} victory points
        </span>}
      </div>
      <div className={css(styles.goods)}>
        {renderGoods(player.goods, board.cargoShips, isShipping && actions.shipGood)}
      </div>
      {pickingExtraGood &&
        this.renderPickingExtraGood()}
      <div>
        {tmpColonistAllocations ? tmpColonistAllocations.parkedColonists : player.parkedColonists} colonists are waiting for something to do.
      </div>
      {tmpColonistAllocations ?
        <button onClick={this.commitAllocations}>
          Done placing colonists
        </button> : null}
      <PlayerBuildings
        city={tmpColonistAllocations ? tmpColonistAllocations.city : player.city}
        turnStatus={turnStatus}
        onChangeInhabitants={this.changeCityInhabitants}
      />
      <div style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {(tmpColonistAllocations ? tmpColonistAllocations.island : player.island).map((item, i) => (
          <PlantationTile
            type={item.type}
            key={i}
            inhabited={item.inhabited}
            onInhabit={
              tmpColonistAllocations ? () => this.changeIslandInhabitants(i)
              : undefined
            }
          />
        ))}
      </div>
    </div>
  }
}

const renderGoods = (goods: {[key: Good]: number}, ships: Array<CargoShipT>, onShip) => {
  // if there's an empty ship, anything goes but taken goods
  // if there's no empty ship, you can only ship what's there
  const shipsByGood = {}
  const emptyShips = []
  if (onShip) {
    ships.forEach((ship: CargoShipT, i) => {
      if (!ship.good) {
        emptyShips.push(i) // TODO have the capacity?
        return
      }
      if (ship.occupied < ship.size) {
        shipsByGood[ship.good] = i
      } else {
        shipsByGood[ship.good] = false
      }
    })
  }

  const noGoods = !Object.keys(goods).some((key: any) => goods[key] > 0)

  if (noGoods) {
    return <div>No goods</div>
  }

  return (
    Object.keys(goods).map((good: any) => (
      goods[good] ?
      <div key={good} className={css(styles.goodLine)}>
        {renderGood(good, goods[good])}
        {onShip && shipsForGood(shipsByGood, emptyShips, good, onShip)}
      </div>
      : null
    ))
  )
}

const shipsForGood = (shipsByGood, emptyShips, good, onShip) => {
  if (shipsByGood[good] === false) return // ship full
  if (shipsByGood[good] != null) {
    return <div className={css(styles.ships)}>
      <button
        className={css(styles.shipButton)}
        onClick={() => onShip(good, shipsByGood[good])}
      >
        Ship on {shipsByGood[good] + 1}
      </button>
    </div>
  }
  if (!emptyShips.length) return // no empty ships
  return <div className={css(styles.ships)}>
    {emptyShips.map(i => (
      <button
        key={i}
        className={css(styles.shipButton)}
        onClick={() => onShip(good, i)}
      >
        Ship on {i + 1}
      </button>
    ))}
  </div>
}

const renderGood = (good, num) => {
  const res = []
  for (let i=0; i<num; i++) {
    res.push(<div
      key={i}
      className={css(styles.good)}
      style={{backgroundColor: sharedStyles.colors[good]}}
    />)
  }
  return <div key={good} className={css(styles.goodsRow)}>
    {res} ({good})
  </div>
}

class PlayerBuildings extends Component {
  render() {
    const {city, onChangeInhabitants} = this.props

    return <div className={css(styles.buildings)}>
      {city.map((building, i) => (
        <BuildingTileEl
          key={i}
          type={building.type}
          inhabitants={building.inhabitants}
          onInhabit={onChangeInhabitants ? () => onChangeInhabitants(i) : undefined}
        />
      ))}
    </div>
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    border: '1px solid #ccc',
    margin: 10,
  },
  itMe: {
    backgroundColor: '#aef'
  },

  extraGood: {
    flexDirection: 'row',
  },

  goods: {
    margin: '10px 0',
    padding: 10,
    border: '1px solid #ccc',
  },

  buildings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  goodsRow: {
    flexDirection: 'row',
  },
  good: sharedStyles.good,
})
