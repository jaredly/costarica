/* @flow */

export type Good = 'coffee' | 'tobacco' | 'corn' | 'sugar' | 'indigo'

// TODO might be good
// export type BuildingType = 'smallIndigo' | 'smallSugar' | 'indigo' | 'sugar' | 'coffee' | 'tobacco'

export type IslandType = Good | 'quarry'

export type IslandSquare = {
  type: ?IslandType,
  inhabited: bool,
}

export type Builting = {
  type: ?string,
  inhabitants: number,
}

export type Player = {
  name: string,
  dubloons: number,
  parkedColonists: number,
  board: {
    city: Array<Array<Builting>>,
    island: Array<IslandSquare>,
  },
}

export type Role = 'settler' | 'mayor' | 'builder' | 'craftsman' | 'trader' | 'captain'

export type Board = {
  players: Array<Player>,

  mayor: number,
  phase: number,
  currentRole: ?Role,
  turn: number,
  usedRoles: Array<Role>,
  roleRewards: {[key: Role]: number},

  cargoShips: Array<{
    good: ?Good,
    size: number,
    occupied: number,
  }>,
  colonistShip: number,
  revealedPlantations: Array<Good>,
  tradingHouse: Array<Good>,

  quarriesLeft: number,
  goods: {[key: Good]: number},
  plantations: {[key: Good]: number},
  colonistsLeft: number,
}

