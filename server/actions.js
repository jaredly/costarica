/* @flow */

import type {StateT, GameT, BoardT, PlayerT, IslandType} from './types'
import type {BuildingType, Good, Role} from './consts'

const playerState = require('./player-state')
const gameUtils = require('./game-state')
const boardState = require('./board')
const utils = require('./utils')
const nextTurn = require('./nextTurn')
const checkState = require('./check')

exports.init = (): StateT => ({pid: -1, status: 'waiting', waitingPlayers: []})

exports.join = (state: StateT, name: string): StateT => {
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

exports.start = (state: StateT): GameT => {
  if (state.status !== 'waiting') {
    throw new Error("Can't join a running game")
  }
  const board = utils.givePlayersFirstPlantation(
    utils.revealPlantations(boardState.init(state.waitingPlayers)))
    // TODO make sure there are a good amount of players
  return board
}

exports.pickRole = (game: GameT, player: number, role: Role): GameT => {
  checkState(!game.turnStatus.currentRole, 'Role should be empty')
  checkState(game.turnStatus.phase === player, 'Not your turn')
  checkState(game.board.usedRoles.indexOf(role) === -1,
             'That role has been used')

  let {players, board: {roleRewards}} = game
  if (roleRewards[role]) {
    players = players.slice()
    players[player].dubloons += roleRewards[role]
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

const npl = (players, id, mod) => {
  const np = players.slice()
  np[id] = mod(np[id])
  return np
}

exports.skipTurn = (game: GameT): GameT => {
  // TODO maybe make sure we're not captaining?
  // if (board.currentRole ===
  return nextTurn(game)
}

exports.settle = (game: GameT, player: number, landType: IslandType): GameT => {
  checkState(game.turnStatus.turn == player, 'Not your turn')
  checkState(game.turnStatus.currentRole == 'settler', 'Not the settling phase')
  checkState(1 + game.players[player].island.length <= 12,
             "Can't have more than 12 things")
  checkState(landType !== 'quarry' ||
             game.turnStatus.phase === player ||
             game.players[player].buildings['constructionHut'],
            "Can't take a quarry")

  return {
    ...nextTurn(game),
    players: npl(game.players, player, player => ({
      ...player,
      island: player.island.concat([{
        type: landType,
        inhabited: !!player.buildings['university'],
      }]),
    })),
  }
}
