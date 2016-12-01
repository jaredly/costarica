/* @flow */

import type {GameT, BoardT, PlayerT, IslandType} from './types'
import type {BuildingType, Good, Role} from './consts'

const checkState = require('./check')
const consts = require('./consts')

const nextRound = (game: GameT): GameT => {
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
    turnStatus: {
      governor,
      phase: governor,
      turn: governor,
      currentRole: null,
    },
    board: {
      ...game.board,
      roleRewards: rewards,
      usedRoles: [],
    }
  }
}

const finishPhase = {
  settler: board => board,
  // TODO fill up the colonists ship
  mayor: board => board,
  builder: board => board,
  craftsman: board => board,
  trader: board => {
    if (board.tradingHouse.length === 4) {
      return {...board, tradingHouse: []}
    }
    return board
  },
  captain: board => ({
    ...board,
    cargoShips: board.cargoShips.map(
      ship => ship.size === ship.occupied ?
        {...ship, occupied: 0} : ship
    ),
  })
}

const nextPhase = (game: GameT): GameT => {
  game = {...game}
  // TODO allow multiple rounds phases?
  game.turnStatus.phase = (game.turnStatus.phase + 1) % game.players.length
  if (game.turnStatus.phase === game.turnStatus.governor) {
    return nextRound(game)
  }
  if (!game.turnStatus.currentRole) {
    throw new Error("Can't move on if no role is chosen")
  }
  return finishPhase[game.turnStatus.currentRole]({
    ...game,
    turnStatus: {
      ...game.turnStatus,
      turn: game.turnStatus.phase,
      currentRole: null,
    }
  })
}

module.exports = (game: GameT): GameT => {
  game = {...game}
  game.turnStatus.turn = (game.turnStatus.turn + 1) % game.players.length
  if (game.turnStatus.turn === game.turnStatus.phase) {
    return nextPhase(game)
  }
  return game
}
