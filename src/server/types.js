/* @flow */

import type {Good, Role, BuildingType} from './consts'

export type IslandType = Good | 'quarry'

type Exact<T> = T & $Shape<T>

export type IslandSquare = Exact<{
  type: IslandType,
  inhabited: bool,
}>

export type BuildingTile = {
  type: BuildingType,
  inhabitants: number,
}

export type PlayerT = {
  id: number,
  name: string,
  dubloons: number,
  victoryPoints: number,
  parkedColonists: number,
  city: Array<BuildingTile>,
  citySize: number,
  goods: {[key: Good]: number},
  island: Array<IslandSquare>,
  buildings: {[key: BuildingType]: true},
  occupiedBuildings: {[key: BuildingType]: number},
  occupiedLand: {[key: IslandType]: number},
}

export type WaitingPlayerT = {
  id: number,
  name: string,
}

export type PreGameT = {
  status: 'waiting',
  pid: number,
  waitingPlayers: Array<WaitingPlayerT>,
}

export type BankT = {
  quarriesLeft: number,
  goods: {[key: Good]: number},
  plantations: {[key: Good]: number},
  colonistsLeft: number,
  buildingsLeft: {[key: BuildingType]: number},
}

export type CargoShipT = {
  good: ?Good,
  size: number,
  occupied: number,
}

export type BoardT = Exact<{
  cargoShips: Array<CargoShipT>,
  colonistShip: number,
  revealedPlantations: Array<Good>,
  tradingHouse: Array<Good>,
  usedRoles: Array<Role>,
  roleRewards: {[key: Role]: number},
}>

export type TurnStatusT = {
  governor: number,
  phase: number,
  currentRole: ?Role,
  turn: number,
  usedPrivilege: boolean,
  usedHacienda: boolean,
}

export type GameT = {
  status: 'playing',
  pid: number,
  players: Array<PlayerT>,
  messages: Array<string>,

  bank: BankT,
  board: BoardT,
  turnStatus: TurnStatusT,
}

export type EmptyGameT = {|
  status: 'not-loaded'
|}

export type StateT = PreGameT | GameT | EmptyGameT
