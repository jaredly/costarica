/* @flow */

import type {GameT, BoardT, PlayerT, IslandType, CargoShipT} from './types'
import type {BuildingType, Good, Role} from './consts'

const checkState = require('./check')
const consts = require('./consts')
const utils = require('./utils')
const shipGood = require('./shipGood')
const npl = require('./npl')

const cantBuildAnything = (player, isBuilder) => {
  if (player.citySize >= 12) {
    return true
  }
  return !Object.keys(consts.buildings).some(key => (
    utils.costOfBuilding(consts.buildings[key], player, isBuilder) <= player.dubloons
  ))
}

const autoCaptain = (game: GameT): GameT => {
  // if no goods, skip
  const player = game.players[game.turnStatus.turn]
  const goodsList = Object.keys(player.goods)
    .filter((good: any) => player.goods[good] > 0)
  // const noGoods = !Object.keys(player.goods).some(good => player.goods[good] > 0)
  console.log(player.name, goodsList)
  if (goodsList.length === 0) {
    return module.exports(game)
  }
  const numWarehouses = (player.occupiedBuildings.smallWarehouse ? 1 : 0) +
    (player.occupiedBuildings.largeWarehouse ? 2 : 0)

  const shipsByGood = {}
  const emptyShips = []
  game.board.cargoShips.forEach((ship: CargoShipT, i) => {
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

  if (goodsList.length === 1) {
    const theGood: any = goodsList[0]
    if (
      shipsByGood[theGood] === false ||
      (shipsByGood[theGood] == null && emptyShips.length === 0)
    ) {
      // can't ship it, and there's only one good to potentially keep
      return module.exports({
        ...game,
        players: npl(game.players, game.turnStatus.turn, player => ({
          ...player,
          goods: {
            [theGood]: numWarehouses > 0 ? player.goods[theGood] : 1,
          }
        }))
      })
    }

    if (shipsByGood[theGood] != null) {
      console.log('auto captain', theGood)
      return module.exports(shipGood(game, theGood, shipsByGood[theGood]))
    }

    // then we know what to keep, anyway.
    if (emptyShips.length === 1) {
      console.log('auto captain empty', theGood, emptyShips)
      return module.exports(shipGood(game, theGood, emptyShips[0]))
    }
  }

  const canShip = Object.keys(player.goods).filter(good => (
    shipsByGood[good] !== false &&
    (shipsByGood[good] != null || emptyShips.length > 1)
  ))
  if (canShip.length === 0 && numWarehouses >= goodsList.length) {
    console.log('you get to keep your stuff')
    // no changes, b/c you can keep all your goods
    return module.exports(game)
  }
  console.log('gotta pick')
  return game
}

const autoPlay = (game: GameT): GameT => {
  switch (game.turnStatus.currentRole) {
    case 'captain':
      return autoCaptain(game)
    default:
      return game
  }
}

const shouldSkip = (game: GameT): boolean => {
  switch (game.turnStatus.currentRole) {
    case 'settler':
      return game.players[game.turnStatus.turn].island.length >= 12
    case 'builder':
      return cantBuildAnything(
        game.players[game.turnStatus.turn],
        game.turnStatus.turn === game.turnStatus.phase
      )
    case 'craftsman':
      // TODO auto-get the goods, and then skip if you're not the phase leader
      return game.turnStatus.turn !== game.turnStatus.phase
    case 'trader':
      // TODO if unable to trade
    case 'captain':
      // return cantShipAnything(game.players[game.turnStatus.turn].goods, game.board.cargoShips)
      // TODO if have no goods, or there are no available ships
    case 'mayor':
    default:
      return false
  }
}

const maybeSkip = (game: GameT): GameT => {
  console.log('maybe skipping', game.turnStatus)
  if (shouldSkip(game)) {
    console.log('really skipping', game.turnStatus)
    return module.exports({
      ...game,
      messages: game.messages.concat([
        `Skipped ${game.players[game.turnStatus.turn].name} because they couldn't do anything`]),
    })
  } else {
    return autoPlay(game)
  }
}

const nextRound = (game: GameT): GameT => {
  // TODO check completion criteria
  const governor = (game.turnStatus.governor + 1) % game.players.length
  console.log(`[[ next round ${game.players[governor].name} ]]`)
  const rewards = {...game.board.roleRewards}
  Object.keys(consts.roles).forEach(role => {
    if (game.board.usedRoles.indexOf(role) === -1) {
      rewards[role] += 1
    }
  })

  return {
    ...game,
    messages: game.messages.concat([`New round! ${game.players[governor].name} is governor`]),
    turnStatus: {
      governor,
      phase: governor,
      turn: governor,
      currentRole: null,
      usedPrivilege: false,
      usedHacienda: false,
    },
    board: {
      ...game.board,
      roleRewards: rewards,
      usedRoles: [],
    }
  }
}

const noop = game => game

const spy = (m, n) => {
  console.log(m, n)
  return n
}

const finishPhase = {
  settler: noop,
  // TODO fill up the colonists ship
  mayor: noop,
  builder: noop,
  craftsman: noop,
  trader: (game: GameT): GameT => {
    if (game.board.tradingHouse.length === 4) {
      const goods = {...game.bank.goods}
      game.board.tradingHouse.forEach(good => goods[good] += 1)
      return {
        ...game,
        bank: {
          ...game.bank,
          goods,
        },
        board: {
          ...game.board,
          tradingHouse: []
        }
      }
    }
    return game
  },
  captain: (game: GameT): GameT => {
    const goods = {...game.bank.goods}
    game.board.cargoShips.forEach(ship => {
      if (ship.size === ship.occupied && ship.good) {
        goods[ship.good] += ship.size
      }
    })
    return {
      ...game,
      bank: {...game.bank, goods},
      board: {
        ...game.board,
        cargoShips: spy('new ships', game.board.cargoShips.map(
          ship => ship.size === ship.occupied ?
            {...ship, good: null, occupied: 0} : ship
        )),
      },
    }
  }
}

const nextPhase = (game: GameT): GameT => {
  game = {...game, turnStatus: {...game.turnStatus}}
  // TODO allow multiple rounds phases?
  game.turnStatus.phase = (game.turnStatus.phase + 1) % game.players.length
  const role = game.turnStatus.currentRole
  if (!role) {
    throw new Error("Can't move on if no role is chosen")
  }
  if (game.turnStatus.phase === game.turnStatus.governor) {
    return nextRound(finishPhase[role](game))
  }
  console.log(`[[ next phase ${game.players[game.turnStatus.phase].name} ]]`)
  console.log(',pvomg tp', game.turnStatus)
  return finishPhase[role]({
    ...game,
    messages: game.messages.concat([`Next phase! ${game.players[game.turnStatus.phase].name}'s turn to choose a role`]),
    turnStatus: {
      ...game.turnStatus,
      turn: game.turnStatus.phase,
      currentRole: null,
    }
  })
}

module.exports = (game: GameT): GameT => {
  // console.log('skipping', game.turnStatus)
  game = {
    ...game,
    turnStatus: {
      ...game.turnStatus,
      usedHacienda: false,
      turn: (game.turnStatus.turn + 1) % game.players.length
    }
  }
  if (game.turnStatus.turn === game.turnStatus.phase) {
    const gm = nextPhase(game)
    console.log('nexted phase', gm.turnStatus)
    return gm
  }
  console.log(`[[ next turn ${game.players[game.turnStatus.turn].name} ]]`)
  return maybeSkip({
    ...game,
    messages: game.messages.concat([
      `${game.players[game.turnStatus.turn].name}'s turn!`
    ])
  })
}

module.exports.maybeSkip = maybeSkip
