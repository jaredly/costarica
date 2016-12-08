// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import makeActions from './actions'

const ws = new WebSocket('ws://' + window.location.hostname + ':7810')

console.log('a')
ws.onopen = () => {
  ReactDOM.render(
    <App
      actions={makeActions(ws)}
    />,
    document.getElementById('root')
  );

}
ws.onerror = () => {
  console.log('failed to ws')
}
ws.onclose = () => {
  console.log('closed')
}
