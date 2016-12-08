/* @flow */

import type {StateT, GameT, BoardT, PlayerT, IslandType} from './types'
import type {BuildingType, Good, Role} from './consts'

const consts = require('./consts')
const playerState = require('./player-state')
const gameUtils = require('./game-state')
const boardState = require('./board')
const utils = require('./utils')
const nextTurn = require('./nextTurn')
const checkState = require('./check')
const shipGood = require('./shipGood')
const npl = require('./npl')

exports.init = (): StateT => ({pid: -1, status: 'waiting', waitingPlayers: []})

/*
type Same<In, Out> = (checker: In, action: Out) => Out & {check: In}
type Checker<A, B, C, D, R> =
  Same<(a: A) => ?string, (a: A) => R> |
  Same<(a: A, b: B) => ?string, (a: A, b: B) => R>
*/

const checked = <T, R>(checker: T, action: any): R => {
  action.check = checker
  return action
}

const checkPhase = (game: GameT, phase: Role): ?string => (
  game.turnStatus.turn !== game.pid && 'Not your turn' ||
  game.turnStatus.currentRole !== phase && 'Wrong phase, expected ' + phase ||
  null
)

exports.join = checked(
  (state: StateT, name: string): ?string => {
    // TODO make sure names are unique
    return state.status !== 'waiting' ?
      "Can't join a running game" : null
  },
  (state: StateT, name: string): StateT => {
    if (state.status !== 'waiting') {
      throw new Error("Can't join a running game")
    }
    return {
      ...state,
      waitingPlayers: state.waitingPlayers.concat([{
        id: state.waitingPlayers.length,
        name
      }]),
    }
  }
)

exports.start = checked(
  (state: StateT): ?string => {
    return state.status !== 'waiting' ?
      "Can't start a running game" : null
  },
  (state: StateT): GameT => {
    if (state.status !== 'waiting') {
      throw new Error("Can't start a running game")
    }
    const game = utils.givePlayersFirstPlantation(
      utils.revealPlantations(boardState.init(state.waitingPlayers)))
      // TODO make sure there are a good amount of players
    return {
      ...game,
      messages: game.messages.concat([
        `New game! ${game.players[game.turnStatus.governor].name} starts as governor`
      ])
    }
  }
)

const noop = game => game

const givePlayersGoods = (game: GameT) => {
  console.log('giving players goods')
  const players = game.players.slice()
  let bank = {...game.bank, goods: {...game.bank.goods}}
  for (let i=0; i<players.length; i++) {
    let ri = (i + game.turnStatus.phase) % players.length
    const goods = {...players[ri].goods}
    const goodsOwed = utils.goodsOwed(players[ri])
    let kindsGot = 0
    Object.keys(goodsOwed).forEach(good => {
      const realized = Math.min(goodsOwed[good], bank.goods[good])
      if (realized > 0) {
        kindsGot += 1
      }
      bank.goods[good] -= realized
      goods[good] = goods[good]|0 + realized
    })
    players[ri] = {
      ...players[ri],
      goods,
    }
    if (players[ri].occupiedBuildings.factory) {
      players[ri].dubloons += [0, 0, 1, 2, 3, 5][kindsGot]
    }
    console.log('player goods', ri, players[ri].goods, goods)
  }
  return {
    ...game,
    players,
    bank,
  }
}

const startPhase = {
  settler: noop,
  mayor: game => ({
    ...game,
    players: game.players.map(player => ({
      ...player,
      parkedColonists: player.parkedColonists + (player.id === game.turnStatus.phase ? 2 : 1),
    })),
    bank: {
      ...game.bank,
      colonistsLeft: game.bank.colonistsLeft - game.players.length - 1,
    },
  }),
  craftsman: givePlayersGoods,
  trader: noop,
  captain: noop,
  builder: noop,
}

exports.pickRole = checked(
  (game: GameT, role: Role): ?string => (
    game.turnStatus.currentRole && 'Role should be empty' ||
    game.turnStatus.phase !== game.pid && 'Not your turn' ||
    game.board.usedRoles.indexOf(role) !== -1 && 'That role has been used' ||
    null
  ),

  (game: GameT, role: Role): GameT => {
    let {players, board: {roleRewards}} = game
    if (roleRewards[role]) {
      players = players.slice()
      players[game.pid].dubloons += roleRewards[role]
      roleRewards = {
        ...roleRewards,
        [role]: 0,
      }
    }

    return nextTurn.maybeSkip(startPhase[role]({
      ...game,
      players,
      board: {
        ...game.board,
        roleRewards,
        usedRoles: game.board.usedRoles.concat([role]),
      },
      turnStatus: {
        ...game.turnStatus,
        currentRole: role,
      },
    }))
  }
)

exports.tradeGood = checked(
  (game: GameT, good: Good): ?string => (
    checkPhase(game, 'trader') ||
    game.players[game.pid].goods[good] <= 0 && "You don't have any to trade" ||
    game.board.tradingHouse.some(item => item === good) &&
    !game.players[game.pid].occupiedBuildings.office && "That good is already being sold" ||
    game.board.tradingHouse.length === 4 && "Trading house is full" ||
    null
  ),

  (game: GameT, good: Good): GameT => nextTurn({
    ...game,
    board: {
      ...game.board,
      tradingHouse: game.board.tradingHouse.concat([good]),
    },
    players: npl(game.players, game.pid, player => ({
      ...player,
      dubloons: player.dubloons +
        consts.goods[good].value +
        (game.turnStatus.turn === game.turnStatus.phase ? 1 : 0) +
        (player.occupiedBuildings.smallMarket ? 1 : 0) +
        (player.occupiedBuildings.largeMarket ? 2 : 0),
      goods: {
        ...player.goods,
        [good]: player.goods[good] - 1,
      },
    }))
  })
)

exports.skipTurn = checked(
  (game: GameT): ?string => (
    game.pid !== game.turnStatus.turn && "You can't skip someone else's turn" ||
    !game.turnStatus && "You have to pick a role" ||
    game.turnStatus.currentRole === 'captain' && "Can't skip captain phase" ||
    null
  ),
  (game: GameT): GameT => {
    return nextTurn(game)
  }
)

type Allocations = {parkedColonists: number, city: Array<number>, island: Array<boolean>}

const hasSameNumberOfColonists = (allocations: Allocations, player: PlayerT): boolean => {
  const c1 = allocations.parkedColonists +
    allocations.city.reduce((n, m) => n + m, 0) +
    allocations.island.reduce((n, b) => n + (b ? 1 : 0), 0)
  const c2 = player.parkedColonists +
    player.city.reduce((n, b) => n + b.inhabitants, 0) +
    player.island.reduce((n, i) => n + (i.inhabited ? 1 : 0), 0)
  return c1 === c2
}

const makeOccupiedLand = island => {
  return island.reduce((io, o) => ({...io, [o.type]: (o.inhabited ? 1 : 0) + (io[o.type]|0)}), {})
}

exports.allocateColonists = checked(
  (game: GameT, allocations: Allocations): ?string => (
    checkPhase(game, 'mayor') ||
    !hasSameNumberOfColonists(allocations, game.players[game.pid]) &&
      "Somehow the number of colonists is not the same" ||
    null
  ),
  (game: GameT, allocations: Allocations): GameT => nextTurn({
    ...game,
    players: npl(game.players, game.pid, player => {
      const island = player.island.map((tile, i) => ({...tile, inhabited: allocations.island[i]}))
      const city = player.city.map((b, i) => ({...b, inhabitants: allocations.city[i]}))
      return {
        ...player,
        city,
        island,
        parkedColonists: allocations.parkedColonists,
        occupiedBuildings: city.reduce((ob, b) => ({...ob, [b.type]: b.inhabitants}), player.occupiedBuildings),
        occupiedLand: makeOccupiedLand(island),
      }
    })
  })
)

exports.pickExtraGood = checked(
  (game: GameT, good: Good): ?string => (
    checkPhase(game, 'craftsman') ||
    game.bank.goods[good] <= 0 && "None of that good left" ||
    // TODO check goodsowed to make sure they deserve it
    null
  ),
  (game: GameT, good: Good): GameT => nextTurn({
    ...game,
    bank: {
      ...game.bank,
      goods: {
        ...game.bank.goods,
        [good]: game.bank.goods[good] - 1,
      },
    },
    players: npl(game.players, game.pid, player => ({
      ...player,
      goods: {
        ...player.goods,
        [good]: player.goods[good] + 1,
      },
    })),
  })
)

const chooseRandomPlantation = (plantations: {[key: Good]: number}): Good => {
  const items = []
  for (let name: any in plantations) {
    for (let i=0; i<plantations[name]; i++) {
      items.push(name)
    }
  }
  return items[parseInt(Math.random() * items.length)]
}

exports.settleExtra = checked(
  (game: GameT): ?string => (
    checkPhase(game, 'settler') ||
    !game.players[game.pid].occupiedBuildings.hacienda && "You don't have an hacienda" ||
    game.turnStatus.usedHacienda && "You've already used your hacienda" ||
    null
  ),

  // TODO dedup w/ settle random code
  (game: GameT): GameT => {
    const type = chooseRandomPlantation(game.bank.plantations)
    return {
      ...game,
      turnStatus: {
        ...game.turnStatus,
        usedHacienda: true,
      },
      players: npl(game.players, game.pid, player => ({
        ...player,
        island: player.island.concat([{
          type: type,
          inhabited: false,
        }]),
      })),
      bank: {
        ...game.bank,
        plantations: {
          ...game.bank.plantations,
          [type]: game.bank.plantations[type] - 1,
        },
      },
    }
  }
)

exports.settleQuarry = checked(
  (game: GameT): ?string => (
    checkPhase(game, 'settler') ||
    !game.bank.quarriesLeft && "No quarries left" ||
    (game.turnStatus.phase !== game.pid &&
     !game.players[game.pid].buildings['constructionHut']) && "Can't take a quarry" ||
     null
  ),

  (game: GameT): GameT => (nextTurn({
    ...game,
    players: npl(game.players, game.pid, player => ({
      ...player,
      island: player.island.concat([{
        type: 'quarry',
        inhabited: !!player.buildings['university'],
      }]),
    })),
    bank: {
      ...game.bank,
      quarriesLeft: game.bank.quarriesLeft - 1,
    },
  }))
)

const warehouseSlots = player => {
  return (player.occupiedBuildings.smallWarehouse ? 1 : 0) +
    (player.occupiedBuildings.largeWarehouse ? 2 : 0)
}

exports.shipGood = checked(
  (game: GameT, good: ?Good, sid: ?number, keep1: ?Good, keepWarehouse: Array<Good>) => (
    checkPhase(game, 'captain') ||
    (good && sid) &&
      (game.players[game.pid].goods[good] <= 0 && "You don't have any of that" ||
        sid >= game.board.cargoShips.length && "That's not a valid ship" ||
        (game.board.cargoShips[sid].good &&
         game.board.cargoShips[sid].good !== good) && "That ship has a different good on it" ||
        game.board.cargoShips.some((ship, i) => i !== sid && ship.good === good) &&
          "That good already has a ship" ||
        game.board.cargoShips[sid].occupied === game.board.cargoShips[sid].size &&
          "That ship is full") ||
    keep1 && game.players[game.pid].goods[keep1] <= 0 && "You don't have any of that to keep" ||
    keepWarehouse.length && keepWarehouse.length > warehouseSlots(game.players[game.pid]) ||
   null
  ),

  (game: GameT, good: ?Good, sid: ?number, keep1: ?Good, keepWarehouse: Array<Good>): GameT => {
    if (good && sid != null) {
      game = shipGood(game, good, sid)
    }
    const goods = {}
    if (keep1) {
      goods[keep1] = 1
    }
    keepWarehouse.forEach(good => {
      goods[good] = game.players[game.pid].goods[good]
    })

    return nextTurn({
      ...game,
      players: npl(game.players, game.pid, player => ({
        ...player,
        goods,
      }))
    })
  }
)

exports.settleRandom = checked(
  (game: GameT): ?string => (
    checkPhase(game, 'settler') ||
    game.players[game.pid].island.length >= 12 && "No space on your property" ||
    null
  ),

  (game: GameT): GameT => {
    const type = chooseRandomPlantation(game.bank.plantations)
    return nextTurn({
      ...game,
      players: npl(game.players, game.pid, player => ({
        ...player,
        island: player.island.concat([{
          type: type,
          inhabited: !!player.buildings['university'],
        }]),
      })),
      bank: {
        ...game.bank,
        plantations: {
          ...game.bank.plantations,
          [type]: game.bank.plantations[type] - 1,
        },
      },
    })
  }
)

exports.settleRevealed = checked(
  (game: GameT, revealedIndex: number): ?string => (
    checkPhase(game, 'settler') ||
    game.players[game.pid].island.length >= 12 && "No space in your island" ||
    null
  ),
  (game: GameT, revealedIndex: number): GameT => {
    const nextRevealed = chooseRandomPlantation(game.bank.plantations)
    const type = game.board.revealedPlantations[revealedIndex]
    return nextTurn({
      ...game,
      players: npl(game.players, game.pid, player => ({
        ...player,
        island: player.island.concat([{
          type: type,
          inhabited: player.buildings.hospice ? true : false,
        }]),
        occupiedLand: player.occupiedBuildings.hospice ? {
          ...player.occupiedLand,
          [type]: (player.occupiedLand[type] || 0) + 1,
        } : player.occupiedLand,
      })),
      board: {
        ...game.board,
        revealedPlantations: npl(game.board.revealedPlantations, revealedIndex, () => nextRevealed),
      },
      bank: {
        ...game.bank,
        plantations: {
          ...game.bank.plantations,
          [nextRevealed]: game.bank.plantations[nextRevealed] - 1,
        }
      }
    })
  }
)

const buildingCost = (game: GameT, type: BuildingType) => {
  const building = consts.buildings[type]
  const isBuilder = game.turnStatus.turn === game.turnStatus.phase
  return building.cost - (isBuilder ? 1 : 0) // TODO quarries
}

exports.build = checked(
  (game: GameT, type: BuildingType): ?string => (
    checkPhase(game, 'builder') ||
    utils.costOfBuilding(
      consts.buildings[type],
      game.players[game.pid],
      game.turnStatus.phase === game.pid
    ) > game.players[game.pid].dubloons && "Not enough money" ||
    game.bank.buildingsLeft[type] <= 0 && "Building not available" ||
    null
  ),
  (game: GameT, type: BuildingType): GameT => {
    return nextTurn({
      ...game,
      bank: {
        ...game.bank,
        buildingsLeft: {
          ...game.bank.buildingsLeft,
          [type]: game.bank.buildingsLeft[type] - 1,
        },
      },
      players: npl(game.players, game.pid, player => ({
        ...player,
        dubloons: player.dubloons - buildingCost(game, type),
        citySize: player.citySize + consts.buildings[type].size,
        city: player.city.concat([{
          type: type,
          inhabitants: player.occupiedBuildings.university ? 1 : 0,
        }]),
        occupiedBuildings: player.occupiedBuildings.university ? {
          ...player.occupiedBuildings,
          [type]: 1
        } : player.occupiedBuildings,
      }))
    })
  }
)
