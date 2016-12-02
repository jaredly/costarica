/* @flow */

import type {WaitingPlayerT, PlayerT} from './types'

function many<T>(num: number, make: () => T): Array<T> {
  const res = []
  for (var i=0; i<num; i++) res.push(make())
  return res
}

module.exports.init = (waitingPlayer: WaitingPlayerT): PlayerT => ({
  id: waitingPlayer.id,
  name: waitingPlayer.name,
  dubloons: 0,
  parkedColonists: 0,
  city: [],
  island: [], // max 12!
  buildings: {},
})
