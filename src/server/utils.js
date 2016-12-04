/* @flow */

import type {GameT, BoardT, PlayerT, BankT, TurnStatusT} from './types'
import type {Role, Good, BuildingT} from './consts'

exports.costOfBuilding = (building: BuildingT, player: PlayerT, isBuilder: boolean) => (
  Math.max(
    0,
    building.cost - (isBuilder ? 1 : 0) - Math.min(building.col, player.occupiedLand.quarry || 0)
  )
)

exports.goodsOwed = (player: PlayerT) => ({
  indigo: Math.min(
    player.occupiedLand.indigo|0,
    player.occupiedBuildings.indigo|0 +
    player.occupiedBuildings.smallIndigo|0
  ),
  sugar: Math.min(
    player.occupiedLand.sugar|0,
    player.occupiedBuildings.sugar|0 +
    player.occupiedBuildings.smallSugar|0
  ),
  coffee: Math.min(
    player.occupiedLand.coffee|0,
    player.occupiedBuildings.coffee|0
  ),
  tobacco: Math.min(
    player.occupiedLand.tobacco|0,
    player.occupiedBuildings.tobacco|0
  ),
  corn: player.occupiedLand.corn|0,
})

exports.canTakeQuarry = (bank: BankT, turnStatus: TurnStatusT, player: PlayerT): boolean => (
  turnStatus.currentRole === 'settler' &&
  turnStatus.turn === player.id &&
  bank.quarriesLeft > 0 &&
  (turnStatus.phase === player.id || player.buildings.constructionHut)
)

exports.revealPlantations = (game: GameT): GameT => {
  if (game.board.revealedPlantations.length >= game.players.length) {
    return game
  }
  const revealedPlantations = game.board.revealedPlantations.slice()
  const plantations = {...game.bank.plantations}
  const types: any = Object.keys(plantations)
  // TODO ensure that the number of plantations left is >= the num we need

  while (revealedPlantations.length < game.players.length + 1) {
    const type = types[parseInt(Math.random() * types.length)]
    if (plantations[type] > 0) {
      plantations[type] -= 1
      revealedPlantations.push(type)
    }
  }
  return {
    ...game,
    board: {...game.board, revealedPlantations},
    bank: {...game.bank, plantations},
  }
}

const playersFirstPieces: {[key: string]: Array<Good>} = {
  '2': ['indigo', 'corn'],
  '3': ['indigo', 'indigo', 'corn'],
  '4': ['indigo', 'indigo', 'corn', 'corn'],
  '5': ['indigo', 'indigo', 'indigo', 'corn', 'corn'],
}

const dubloonsForPlayers = {
  '2': 2,
  '3': 2,
  '4': 3,
  '5': 4,
}

exports.givePlayersFirstPlantation = (game: GameT): GameT => {
  const plantations = {...game.bank.plantations}
  const players = game.players.map((player, i) => {
    const good = playersFirstPieces['' + game.players.length][i]
    plantations[good] -= 1
    return {
      ...player,
      dubloons: dubloonsForPlayers[game.players.length],
      island: [{type: good, inhabited: false}],
    }
  })
  return {...game, bank: {...game.bank, plantations}, players}
}
