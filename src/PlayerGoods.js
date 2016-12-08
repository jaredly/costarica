// @flow

import type {PlayerT, CargoShipT} from './server/types'
import type {Good} from './server/consts'

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import * as sharedStyles from './styles'
import utils from './server/utils'
import consts from './server/consts'

type MainProps = {
  player: PlayerT,
  onShip: ?(good: ?Good, sid: ?number, keep1: ?Good, warehouseGoods: Array<Good>) => void,
  onTrade: ?(good: Good) => void,
  tradingHouse: Array<Good>,
  cargoShips: Array<CargoShipT>,
}

export default ({player, onShip, onTrade, cargoShips, tradingHouse}: MainProps) => {
  if (onShip) {
    console.log('render player', player.goods)
    return <CaptainsGoods
      goods={player.goods}
      cargoShips={cargoShips}
      onShip={onShip}
      numWarehouses={
        (player.occupiedBuildings.smallWarehouse ? 1 : 0) +
        (player.occupiedBuildings.largeWarehouse ? 2 : 0)
      }
    />
  }

  const goods = Object.keys(player.goods).map((good: any) => (
    player.goods[good] ?
    <div key={good} className={css(styles.goodRow)}>
      {renderGood(good, player.goods[good])}
      {(onTrade && (tradingHouse.indexOf(good) === -1 || player.occupiedBuildings.office)) ?
        <button onClick={() => onTrade(good)}>
          Trade in!
        </button> : null}
    </div>
    : null
  ))

  if (!goods.some(x => x)) {
    return <div>No goods</div>
  }

  return <div >
    {goods}
  </div>
}

const processShips = (cargoShips) => {
  const shipsByGood = {}
  const emptyShips = []
  cargoShips.forEach((ship: CargoShipT, i) => {
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
  return {shipsByGood, emptyShips}
}

type Props = {
  goods: {[key: Good]: number},
  cargoShips: Array<CargoShipT>,
  numWarehouses: number,
  onShip: (good: ?Good, sid: ?number, keep1: ?Good, keepWarehouse: Array<Good>) => void,
}

class CaptainsGoods extends Component {
  state: {
    shipGood: ?Good,
    goodShipped: number,
    sid: ?number,
    keepGood: ?Good,
    warehouseGoods: Array<Good>,
  }

  constructor(props: Props) {
    super()
    this.state = {
      shipGood: null,
      goodShipped: 0,
      sid: null,
      keepGood: null,
      warehouseGoods: [],
    }
    const goods = this.canShip(props)
    if (goods && Object.keys(goods).length === 1 && goods[Object.keys(goods)[0]].length === 1) {
      console.log(goods)
      this.state.shipGood = (Object.keys(goods)[0]: any)
      this.state.sid = goods[this.state.shipGood][0]
    }
  }

  shipGood = (good: Good, sid: number) => {
    const goodShipped = Math.min(
      this.props.cargoShips[sid].size -
      this.props.cargoShips[sid].occupied,
      this.props.goods[good]
    )

    const left = this.goodsLeft({shipGood: good, goodShipped})
    if (!left.length) {
      return this.props.onShip(good, sid, null, [])
    }
    if (left.length <= this.props.numWarehouses) {
      return this.props.onShip(good, sid, null, left)
    }
    if (left.length == 1) {
      return this.props.onShip(good, sid, left[0], [])
    }
    this.setState({
      shipGood: good,
      goodShipped,
      sid,
    })
  }

  goodsLeft = (state: any) => {
    const goods = Object.keys(this.props.goods).filter(good => (
      this.props.goods[good] - (
        good === state.shipGood ? state.goodShipped : 0
      ) > 0
    ))
    return goods
  }

  canShip = (props: Props) => {
    if (this.state.shipGood) return null
    const {shipsByGood, emptyShips} = processShips(props.cargoShips)
    const canShip = {}
    Object.keys(props.goods).forEach((good: any) => {
      if (props.goods[good] <= 0) return
      if (shipsByGood[good] === false) return
      if (shipsByGood[good] == null) {
        canShip[good] = emptyShips
      } else {
        canShip[good] = [shipsByGood[good]]
      }
    })
    console.log('canship', canShip, props.goods, shipsByGood, emptyShips)
    return canShip
  }

  toggleStore = (good: Good) => {
    if (this.state.warehouseGoods.indexOf(good) === -1) {
      this.setState({
        warehouseGoods: this.state.warehouseGoods.concat([good]),
      })
      return
    }
    const goods = this.state.warehouseGoods.slice()
    goods.splice(goods.indexOf(good), 1)
    this.setState({warehouseGoods: goods})
  }

  keepGood = (good: Good) => {
    this.props.onShip(
      this.state.shipGood,
      this.state.sid,
      good,
      this.state.warehouseGoods
    )
  }

  render() {
    const {goods} = this.props
    const canShip: ?any = this.canShip(this.props)
    console.log('canship', canShip)
    if (canShip && Object.keys(canShip).length) {
      return <div className={css(styles.container)}>
        Pick a good to ship
        {Object.keys(canShip).map(good => (
          <div
            key={good}
            className={css(styles.shipGood)}
          >
            {renderGood(good, goods[good])}
            {canShip[good].map(ship => (
              <button
                key={ship}
                onClick={() => this.shipGood(good, ship)}
              >
                Ship {ship + 1}
              </button>
            ))}
          </div>
        ))}
      </div>
    }

    const goodsLeft: Array<any> = this.goodsLeft(this.state)
    if (!goodsLeft.length) {
      return <div>
        <button
          // This probably shouldn't happen?
        >
          Ok, ship it!
        </button>
      </div>
    }

    const {shipGood, goodShipped} = this.state

    if (!this.props.numWarehouses || this.state.warehouseGoods === this.props.numWarehouses) {
      return <div className={css(styles.container)}>
        {goodsLeft.map(good => (
          <div key={good} onClick={() => this.keepGood(good)}>
            keep 1 of
            {renderGood(good, goods[good] - (good === shipGood ? goodShipped : 0))}
          </div>
        ))}
      </div>
    }

    return <div className={css(styles.container)}>
      {goodsLeft.map(good => (
        <div
          key={good}
          className={css(styles.goodLeft)}
          onClick={() => this.toggleStore(good)}
        >
          {this.state.warehouseGoods.indexOf(good) === -1 ?
            'Not storing' : 'Storing'}
          {renderGood(good, goods[good] - (good === shipGood ? goodShipped : 0))}
        </div>
      ))}
    </div>
  }
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


const styles = StyleSheet.create({
  container: {

  },

  shipGood: {
    flexDirection: 'row',
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
