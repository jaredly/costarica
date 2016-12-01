/* @flow */

import type {PreGame, Board, Player} from './types'

exports.init = (): PreGame => ({
  status: 'waiting',
  waitingPlayers: [],
})
