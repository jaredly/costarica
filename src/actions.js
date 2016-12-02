
import type {StateT} from './server/types'
import serverActions from './server/actions'

export type actions = {
  init: () => void,
}

const checked = (checker, action) => {
  const fn = (...args) => {
    const res = checker(...args)
    if (res) throw new Error(res)
    return action(...args)
  }
  fn.check = checker
  return fn
}

export default (ws) => {

  let currentState: StateT = null
  const listeners = {
    state: [],
    error: [],
  }
  const send = data => ws.send(JSON.stringify(data))

  window.hack = fn => {
    fn(currentState)
    ws.send(JSON.stringify({type: 'hack', value: currentState}))
  }

  ws.onmessage = event => {
    // console.log('got message', event.data)
    const data = JSON.parse(event.data.toString())
    if (data.type === 'state') {
      currentState = data.value;
      window._currentState = currentState
    }
    ;(listeners[data.type] || []).forEach(fn => fn(data.value))
  }

  const res = {}
  for (let name in serverActions) {
    if (name === 'init') {
      res.init = checked(
        () => currentState === null ? null : "Already initialized",
        () => send({type: 'init'})
      )
    } else if (['join', 'start'].indexOf(name) !== -1) {
      res[name] = checked(
        (...args) => (
          (!currentState || currentState.status !== "waiting") ?
            "Game not ready" : serverActions[name].check(currentState, ...args)
        ),
        (...args) => send({type: 'pre-action', name, args})
      )
    } else {
      res[name] = checked(
        (...args) => (
          (!currentState || currentState.status !== "playing") ?
            "Game not in play" : serverActions[name].check(currentState, ...args)
        ),
        (...args) => send({type: 'action', name, args})
      )
    }
  }

  res.addStateListener = fn => listeners.state.push(fn)
  res.addErrorListener = fn => listeners.error.push(fn)

  return res
}
