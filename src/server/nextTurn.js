/* @flow */

import type {GameT, BoardT, PlayerT, IslandType} from './types'
import type {BuildingType, Good, Role} from './consts'

const checkState = require('./check')
const consts = require('./consts')
const utils = require('./utils')

const cantBuildAnything = (player, isBuilder) => {
  if (player.citySize >= 12) {
    return true
  }
  return !Object.keys(consts.buildings).some(key => (
    utils.costOfBuilding(consts.buildings[key], player, isBuilder) <= player.dubloons
  ))
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
    return game
  }
}

const nextRound = (game: GameT): GameT => {
  console.log('next round')
  // TODO check completion criteria
  const governor = (game.turnStatus.governor + 1) % game.players.length
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

const finishPhase = {
  settler: noop,
  // TODO fill up the colonists ship
  mayor: noop,
  builder: noop,
  craftsman: noop,
  trader: (game: GameT): GameT => {
    if (game.board.tradingHouse.length === 4) {
      return {...game, board: {...game.board, tradingHouse: []}}
    }
    return game
  },
  captain: (game: GameT): GameT => ({
    ...game,
    board: {
      ...game.board,
      cargoShips: game.board.cargoShips.map(
        ship => ship.size === ship.occupied ?
          {...ship, occupied: 0} : ship
      ),
    },
  })
}

const nextPhase = (game: GameT): GameT => {
  console.log('next phase')
  game = {...game, turnStatus: {...game.turnStatus}}
  // TODO allow multiple rounds phases?
  game.turnStatus.phase = (game.turnStatus.phase + 1) % game.players.length
  if (game.turnStatus.phase === game.turnStatus.governor) {
    return nextRound(game)
  }
  console.log(',pvomg tp', game.turnStatus)
  if (!game.turnStatus.currentRole) {
    throw new Error("Can't move on if no role is chosen")
  }
  return finishPhase[game.turnStatus.currentRole]({
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
  console.log('skipping', game.turnStatus)
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
  return maybeSkip({
    ...game,
    messages: game.messages.concat([
      `${game.players[game.turnStatus.turn].name}'s turn!`
    ])
  })
}

module.exports.maybeSkip = maybeSkip
