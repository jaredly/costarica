/* @flow */

import type {WaitingPlayerT, PlayerT, BoardT, GameT, BankT} from './types'

import playerState from './player-state'

const consts = require('./consts')

const colonistsForPlayers = {
  '2': 40,
  '3': 55,
  '4': 75,
  '5': 95,
}

const cargoCounts = {
  '2': [4, 6],
  '3': [4, 5, 6],
  '4': [5, 6, 7],
  '5': [6, 7, 8],
}

const fullGoodsComplement = nplayers => {
  const res = {}
  Object.keys(consts.goods).forEach(key => res[key] = consts.goods[key].count - (nplayers === 2 ? 2 : 0))
  return res
}

const fullPlantationsComplement = nplayers => {
  const res = {}
  Object.keys(consts.goods).forEach(key => res[key] = consts.goods[key].plantations - (nplayers === 2 ? 3 : 0))
  return res
}

const buildingsForPlayers = nplayers => {
  const res = {}
  // TODO adjust for nplayers != 2
  Object.keys(consts.buildings.factories).forEach(
      col => Object.keys(consts.buildings.factories[col]).forEach(
        key => res[key] = 2))
  Object.keys(consts.buildings.violet).forEach(
      col => Object.keys(consts.buildings.violet[col]).forEach(
        key => res[key] = 1))
  return res
}

module.exports.init = (players: Array<WaitingPlayerT>): GameT => ({
  status: 'playing',
  players: players.map(playerState.init),
  pid: -1,

  turnStatus: {
    // Turn stuff
    governor: 0, // id of player who's governor
    phase: 0, // which player is starting this phase?
    turn: 0, // which player's turn is it within this phase?
    currentRole: null, // if null, the player still needs to choose
  },

  board: {
    cargoShips: cargoCounts[players.length].map(num => ({
      good: null,
      size: num,
      occupied: 0,
    })),
    colonistShip: players.length,
    revealedPlantations: [], // TODO reveal some plantations
    tradingHouse: [], // nothing in there yet
    usedRoles: [],
    roleRewards: {}, // string -> int - how many dubloons on this one?
  },

  bank: {
    quarriesLeft: players.length === 2 ? 5 : 8,
    goods: fullGoodsComplement(players.length),
    plantations: fullPlantationsComplement(players.length),
    colonistsLeft: colonistsForPlayers[players.length],
    buildingsLeft: buildingsForPlayers(players.length),
  },
})
