
const server = require('http').createServer()
const wss = new (require('ws').Server)({server})

wss.on('connection', ws => {
  console.log('connected')
  ws.on('message', evt => {
    console.log(evt.data)
    console.log('evt', evt)
    ws.send('gotcha')
  })
})

server.listen(7810, () => {
  console.log('ready')
})

