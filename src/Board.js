// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {BoardT, TurnStatusT} from './server/types'
import consts from './server/consts'

export default class Board extends Component {
  props: {
    turnStatus: TurnStatusT,
    actions: any,
    board: BoardT,
    pid: number,
  }

  render() {
    const {board, pid, turnStatus, actions} = this.props
    return <div className={css(styles.container)}>
      Board
      Current role: {turnStatus.currentRole}
      <RolePicker
        usedRoles={board.usedRoles}
        currentRole={turnStatus.currentRole}
        canPick={pid === turnStatus.turn && pid === turnStatus.phase && !turnStatus.currentRole}
        onPick={role => actions.pickRole(role)}
      />
    </div>
  }
}

const RolePicker = ({usedRoles, canPick, onPick, currentRole}) => (
  <div className={css(styles.roles)}>
    {Object.keys(consts.roles).map(role => (
      <div
        key={role}
        onClick={canPick ? () => onPick(role) : null}
        className={css(
          styles.role,
          canPick && usedRoles.indexOf(role) === -1 && styles.roleClickable,
          role === currentRole && styles.currentRole,
        )}
      >
        <div className={css(styles.roleTitle)}>
          {role}
        </div>
      </div>
    ))}
  </div>
)

const styles = StyleSheet.create({
  roles: {
    flexDirection: 'row'
  },
  role: {
    padding: '5px 10px',
    height: 120,
    width: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
    // border: '1px solid',
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#ccc',
    margin: 10,
  },

  roleClickable: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#eee',
    }
  },

  currentRole: {
    outline: '3px solid #aef',
    borderColor: '#aef',
  },

  roleTitle: {
    marginBottom: 20,
  },
})
