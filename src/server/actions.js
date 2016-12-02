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

exports.init = (): StateT => ({pid: -1, status: 'waiting', waitingPlayers: []})

/*
type Same<In, Out> = (checker: In, action: Out) => Out & {check: In}
type Checker<A, B, C, D, R> =
  Same<(a: A) => ?string, (a: A) => R> |
  Same<(a: A, b: B) => ?string, (a: A, b: B) => R>
*/

const npl = (players, id, mod) => {
  const np = players.slice()
  np[id] = mod(np[id])
  return np
}

const checked = <T, R>(checker: T, action: any): R => {
  action.check = checker
  return action
}

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
    const board = utils.givePlayersFirstPlantation(
      utils.revealPlantations(boardState.init(state.waitingPlayers)))
      // TODO make sure there are a good amount of players
    return board
  }
)

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

    return {
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
    }
  }
)

exports.skipTurn = checked(
  (game: GameT): ?string => null,
  (game: GameT): GameT => {
    // TODO maybe make sure we're not captaining?
    // if (board.currentRole ===
    return nextTurn(game)
  }
)

const checkPhase = (game: GameT, phase: Role): ?string => (
  game.turnStatus.turn !== game.pid && 'Not your turn' ||
  game.turnStatus.currentRole !== phase && 'Wrong phase, expected ' + phase ||
  null
)

exports.settle = checked(
  (game: GameT, landType: IslandType): ?string => (
    checkPhase(game, 'settler') ||
    1 + game.players[game.pid].island.length > 12 && "Can't have more than 12 things" ||
    (landType === 'quarry' ?
      (!game.bank.quarriesLeft && "No quarries left") :
      (!game.bank.plantations[landType] && "None of that planation left")) ||
    (landType === 'quarry' &&
     game.turnStatus.phase !== game.pid &&
     !game.players[game.pid].buildings['constructionHut']) && "Can't take a quarry" ||
     null
  ),

  (game: GameT, landType: IslandType): GameT => {
    return nextTurn({
      ...game,
      players: npl(game.players, game.pid, player => ({
        ...player,
        island: player.island.concat([{
          type: landType,
          inhabited: !!player.buildings['university'],
        }]),
      })),
    })
  }
)

exports.build = checked(
  (game: GameT, type: BuildingType): ?string => (
    checkPhase(game, 'builder') ||
    consts.buildings[type].cost > game.players[game.pid].dubloons && "Not enough money" ||
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
        dubloons: player.dubloons - consts.buildings[type].cost,
        city: player.city.concat([{
          type: type,
          inhabitants: player.buildings.university ? 1 : 0,
        }])
      }))
    })
  }
)
