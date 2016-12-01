/* @flow */

import type {Player} from './types'

function many<T>(num: number, make: () => T): Array<T> {
  const res = []
  for (var i=0; i<num; i++) res.push(make())
  return res
}

module.exports.init = (id: number, name: string): Player => ({
  id,
  name,
  dubloons: 0,
  parkedColonists: 0,
  city: many(4, () => many(3, () => ({
    type: null, // this is the building type
    tall: false, // if this takes 2 spaces
    inhabitants: 0, // some cards require several
  }))),
  island: [], // max 12!
  buildings: {},
})

