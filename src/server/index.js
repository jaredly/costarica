// @flow

import type {StateT, PreGameT} from './types'

const server = require('http').createServer()
const wss = new (require('ws').Server)({server})
const fs = require('fs')

const actions = require('./actions')

const args = process.argv
console.log(args)

let state: StateT = require('./game-state').init()
state = actions.start({
  pid: -1,
  status: 'waiting',
  waitingPlayers: [{id: 0, name: 'Jared'}, {id: 1, name: 'Selina'}],
})

if (args.length > 2) {
  const saved: any = JSON.parse(fs.readFileSync(args[2], 'utf8'))
  state = saved
}

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
  fs.writeFileSync("./saved.game", JSON.stringify(state, null, 2))
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

const handleInit = (state, ws) => {
  let pid
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
  return {pid, message: {type: 'state', value: {...state, pid}}}
}

const handlePreAction = (playerState, name, args): {state?: StateT, message?: any} => {
  if (playerState.status !== 'waiting') {
    return {message: {type: 'error', value: "Can't use a pre-action on a running game"}}
  }
  if (!actions[name]) {
    return {message: {type: 'errpr', value: 'Unknown action type: ' + name}}
  }
  const error = actions[name].check(playerState, ...args)
  if (error) {
    return {message: {type: 'error', value: "Precondition failed: " + error}}
  }
  try {
    state = actions[name](playerState, ...args)
  } catch (e) {
    console.log('pre-errored', e)
    return {message: {type: 'error', value: e.message}}
  }
  return {state}
}

const handleAction = (playerState, name, args): {state?: StateT, message?: any} => {
  if (playerState.status !== 'playing') {
    return {message: {type: 'error', value: "Game is not in play"}}
  }
  console.log('action', name, args)
  if (!actions[name]) {
    return {message: {type: 'error', value: 'Unknown action type: ' + name}}
  }
  const error = actions[name].check(playerState, ...args)
  if (error) {
    return {message: {type: 'error', value: "Precondition failed: " + error}}
  }
  try {
    state = actions[name](playerState, ...args)
  } catch (e) {
    console.log('errored', e)
    return {message: {type: 'error', value: e.message}}
  }
  return {state}
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
      const {pid: npid, message} = handleInit(state, ws)
      pid = npid
      send(message)
    } else if (data.type === 'pre-action') {
      const {state: newState, message} = handlePreAction({...state, pid}, data.name, data.args)
      if (message) {
        send(message)
      }
      if (newState) {
        if (data.name === 'join' && newState.status === "waiting") {
          pid = newState.waitingPlayers.length - 1
          allConnections.set(ws, pid)
          connectedPlayers.add(pid)
        }
        state = newState
        updateStates()
      }
    } else if (data.type === 'action') {
      const {state: newState, message} = handleAction({...state, pid}, data.name, data.args)
      if (message) {
        console.log('sending', message)
        send(message)
      }
      if (newState) {
        console.log('update state')
        state = newState
        updateStates()
      }
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
