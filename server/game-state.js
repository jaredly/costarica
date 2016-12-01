/* @flow */

import type {PreGameT, Board, Player} from './types'

exports.init = (): PreGameT => ({
  status: 'waiting',
  waitingPlayers: [],
  pid: -1,
})
