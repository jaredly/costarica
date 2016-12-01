/* @flow */

import type {Good, Role, BuildingType} from './consts'

export type IslandType = Good | 'quarry'

type Exact<T> = T & $Shape<T>

export type IslandSquare = Exact<{
  type: ?IslandType,
  inhabited: bool,
}>

export type Builting = {
  type: ?BuildingType,
  inhabitants: number,
}

export type Player = {
  id: number,
  name: string,
  dubloons: number,
  parkedColonists: number,
  city: Array<Array<Builting>>,
  island: Array<IslandSquare>,
  buildings: {[key: BuildingType]: true},
}

export type PreGame = {
  status: 'waiting',
  waitingPlayers: Array<Player>,
}

export type Bank = {
  quarriesLeft: number,
  goods: {[key: Good]: number},
  plantations: {[key: Good]: number},
  colonistsLeft: number,
  buildingsLeft: {[key: BuildingType]: number},
}

export type Board = Exact<{
  cargoShips: Array<{
    good: ?Good,
    size: number,
    occupied: number,
  }>,
  colonistShip: number,
  revealedPlantations: Array<Good>,
  tradingHouse: Array<Good>,
  usedRoles: Array<Role>,
  roleRewards: {[key: Role]: number},
}>

export type TurnStatus = {
  governor: number,
  phase: number,
  currentRole: ?Role,
  turn: number,
}

export type Game = {
  status: 'playing',
  players: Array<Player>,

  bank: Bank,
  board: Board,
  turnStatus: TurnStatus,
}

export type State = PreGame | Game

