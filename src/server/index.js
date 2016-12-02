// @flow

import type {StateT, PreGameT} from './types'

const server = require('http').createServer()
const wss = new (require('ws').Server)({server})

const actions = require('./actions')

let state: StateT = require('./game-state').init()
state = actions.start({
  pid: -1,
  status: 'waiting',
  waitingPlayers: [{id: 0, name: 'Jared'}, {id: 1, name: 'Selina'}],
})
let connectedPlayers = new Set()

let allConnections = new Map()

const deepMerge: any = (a, b) => {
  if (!a || !b) return b
  if (Array.isArray(a) && Array.isArray(b)) {
    return b
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return b
  }
  const merged = {...a}
  for (let name in b) {
    merged[name] = deepMerge(name[a], name[b])
  }
  return merged
}

const updateStates = () => {
  allConnections.forEach((pid, ws) => {
    console.log('sending state', pid)
    ws.send(JSON.stringify({
      type: 'state',
      value: {
        ...state,
        pid
      }
    }))
  })
}

wss.on('connection', ws => {
  console.log('connected')
  let pid = -1
  allConnections.set(ws, pid)
  const send = data => ws.send(JSON.stringify(data))

  ws.on('message', evt => {
    const data = JSON.parse(evt)
    if (data.type === 'init') {
      console.log('init')
      if (state.status === 'playing') {
        for (let i=0; i<state.players.length; i++) {
          if (!connectedPlayers.has(i)) {
            pid = i
            console.log('resume')
            allConnections.set(ws, i)
            connectedPlayers.add(i)
            break
          }
        }
      } else if (state.status === 'waiting') {
        for (let i=0; i<state.waitingPlayers.length; i++) {
          if (!connectedPlayers.has(i)) {
            pid = i
            console.log('resume')
            allConnections.set(ws, i)
            connectedPlayers.add(i)
            break
          }
        }
      }
      // TODO if we're missing a player, try to reconnect
      send({type: 'state', value: {...state, pid}})
    } else if (data.type === 'pre-action') {
      if (state.status !== 'waiting') {
        return send({type: 'error', value: "Can't use a pre-action on a running game"})
      }
      const playerState = {...state, pid}
      const error = actions[data.name].check(playerState, ...data.args)
      if (error) {
        return send({type: 'error', value: "Precondition failed: " + error})
      }
      try {
        state = actions[data.name](playerState, ...data.args)
      } catch (e) {
        return send({type: 'error', value: e.message})
      }
      if (data.name === 'join') {
        pid = state.waitingPlayers.length - 1
        allConnections.set(ws, pid)
        connectedPlayers.add(pid)
      }
      updateStates()

    } else if (data.type === 'action') {
      if (state.status !== 'playing') {
        return send({type: 'error', value: "Game is not in play"})
      }
      console.log('action', data.name, data.args)
      const playerState = {...state, pid}
      const error = actions[data.name].check(playerState, ...data.args)
      if (error) {
        return send({type: 'error', value: "Precondition failed: " + error})
      }
      try {
        state = actions[data.name](playerState, ...data.args)
      } catch (e) {
        return send({type: 'error', value: e.message})
      }
      updateStates()
    } else if (data.type === 'hack') {
      state = data.value
      updateStates()
    }
  })

  ws.on('close', () => {
    allConnections.delete(ws)
    connectedPlayers.delete(pid)
    console.log('closed')
  })
})

const done: any = (value, err) => {
  console.log('ready')
}
server.listen(7810, done)
