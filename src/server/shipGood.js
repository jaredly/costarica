// @flow
import type {Good} from './consts'
import type {GameT} from './types'

const npl = <T>(items: Array<T>, index, mod: (arg: T) => T): Array<T> => {
  const np = items.slice()
  np[index] = mod(np[index])
  return np
}

const shipGood = module.exports = (game: GameT, good: Good, sid: number): GameT => {
  const ship = game.board.cargoShips[sid]
  const numGoods = Math.min(
    game.players[game.turnStatus.turn].goods[good],
    ship.size - ship.occupied
  )
  console.log('shipping', good, numGoods, game.turnStatus.turn)
  return {
    ...game,
    players: npl(game.players, game.turnStatus.turn, player => ({
      ...player,
      victoryPoints: (player.victoryPoints|0) + numGoods +
        (game.turnStatus.turn === game.turnStatus.phase ? 1 : 0) +
        (player.occupiedBuildings.harbor ? 1 : 0),
      goods: {
        ...player.goods,
        [good]: player.goods[good] - numGoods,
      },
    })),
    board: {
      ...game.board,
      cargoShips: npl(game.board.cargoShips, sid, ship => ({
        ...ship,
        occupied: ship.occupied + numGoods,
        good,
      })),
    },
  }
}
