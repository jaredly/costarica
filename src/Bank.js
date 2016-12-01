// @flow

import React, {Component} from 'react'
import {css, StyleSheet} from 'aphrodite'

import type {BankT} from '../server/types'

export default class Bank extends Component {
  props: {
    bank: BankT,
    actions: {},
    myTurn: boolean,
  }
  
  render() {
    const {bank, actions, myTurn} = this.props
    return <div className={css(styles.container)}>
      Bank<br/>
      Quarries: {bank.quarriesLeft}<br/>
      Goods: some
      plantations: some
      colonistsLeft: {bank.colonistsLeft}<br/>
      buildingsLeft: some
    </div>
  }
}

const styles = StyleSheet.create({
  container: {

  }
})
