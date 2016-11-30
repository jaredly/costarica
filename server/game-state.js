/* @flow */

import type {Player, Board} from './types'

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

const fullGoodsCommplement = () => {
  const res = {}
  Object.keys(consts.goods).forEach(key => res[key] = consts.goods[key].count)
  return res
}

const fullPlantationsComplement = () => {
  const res = {}
  Object.keys(consts.goods).forEach(key => res[key] = consts.goods[key].plantations)
  return res
}

module.exports.init = (players: Array<Player>): Board => ({
  players: players,

  // Turn stuff
  mayor: 0, // id of player who's mayor
  phase: 0, // which player is starting this phase?
  currentRole: null, // if null, the player still needs to choose
  turn: 0, // which player's turn is it within this phase?
  usedRoles: [],
  roleRewards: {}, // string -> int - how many dubloons on this one?

  cargoShips: cargoCounts[players.length].map(num => ({
    good: null,
    size: num,
    occupied: 0,
  })),
  colonistShip: players.length,
  revealedPlantations: [], // TODO reveal some plantations
  tradingHouse: [], // nothing in there yet

  // bank
  quarriesLeft: 8, // TODO should this be modified for # players?
  goods: fullGoodsCommplement(),
  plantations: fullPlantationsComplement(),
  colonistsLeft: colonistsForPlayers[players.length],
})

