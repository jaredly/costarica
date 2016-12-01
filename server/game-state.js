/* @flow */

import type {PreGameT, BoardT, PlayerT} from './types'

exports.init = (): PreGameT => ({
  status: 'waiting',
  waitingPlayers: [],
  pid: -1,
})
