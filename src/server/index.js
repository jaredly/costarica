// @flow

import type {StateT} from './types'

const server = require('http').createServer()
const wss = new (require('ws').Server)({server})

const actions = require('./actions')

let state: StateT = require('./game-state').init()
let connectedPlayers = new Set()

let allConnections = new Map()

const updateStates = () => {
  allConnections.forEach((pid, ws) => {
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
  allConnections.set(ws, -1)
  const send = data => ws.send(JSON.stringify(data))

  ws.on('message', evt => {
    const data = JSON.parse(evt.data)
    if (data.type === 'init') {
      // TODO if we're missing a player, try to reconnect
      send({type: 'state', value: state})
    } else if (data.type === 'pre-action') {
      if (state.status !== 'waiting') {
        return send({type: 'error', value: "Can't use a pre-action on a running game"})
      }
      const error = actions[data.name].check(state, ...data.args)
      if (error) {
        return send({type: 'error', value: "Precondition failed: " + error})
      }
      try {
        state = actions[data.name](state, ...data.args)
      } catch (e) {
        return send({type: 'error', value: e.message})
      }
      if (data.name === 'join') {
        allConnections.set(ws, state.waitingPlayers.length - 1)
      }
      updateStates()

    } else if (data.type === 'action') {
      if (state.status !== 'playing') {
        return send({type: 'error', value: "Game is not in play"})
      }
      const error = actions[data.name].check(state, ...data.args)
      if (error) {
        return send({type: 'error', value: "Precondition failed: " + error})
      }
      try {
        state = actions[data.name](state, ...data.args)
      } catch (e) {
        return send({type: 'error', value: e.message})
      }
      updateStates()
    }
  })

  ws.on('close', () => {
    allConnections.delete(ws)
  })
})

const done: any = (value, err) => {
  console.log('ready')
}
server.listen(7810, done)
