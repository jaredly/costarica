/* @flow */

import type {GameT, Board, Player} from './types'
import type {Role, Good} from './consts'

exports.revealPlantations = (game: GameT): GameT => {
  if (game.board.revealedPlantations.length >= game.players.length) {
    return game
  }
  const revealedPlantations = game.board.revealedPlantations.slice()
  const plantations = {...game.bank.plantations}
  const types: any = Object.keys(plantations)
  // TODO ensure that the number of plantations left is >= the num we need

  while (revealedPlantations.length < game.players.length) {
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

