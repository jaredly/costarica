/* @flow */

function StateError(message: string) {this.message = message}

const checkState = (val: boolean, message: string) => {
  if (!val) throw new StateError(message)
}

module.exports = checkState
