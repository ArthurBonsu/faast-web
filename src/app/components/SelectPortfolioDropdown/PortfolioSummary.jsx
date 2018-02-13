import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import { getWalletWithHoldings } from 'Selectors'
import display from 'Utilities/display'
import styles from './style'

const PortfolioSummary = ({ wallet: { id, label, typeLabel, totalFiat, iconUrl } }) => (
  <Row className='large-gutters-x align-items-center'>
    <Col xs='auto'><img src={iconUrl} className={styles.walletIcon}/></Col>
    <Col>
      <Row className='no-gutters justify-content-between'>
        <Col xs='12'><h6 className={classNames({ 'font-italic': id === 'default' })}>{label}</h6></Col>
        <Col xs='12' sm='auto'>{typeLabel}</Col>
        <Col xs='12' sm='auto'>{display.fiat(totalFiat)}</Col>
      </Row>
    </Col>
  </Row>
)

PortfolioSummary.propTypes = {
  id: PropTypes.string.isRequired,
}

const mapStateToProps = createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
})

export default connect(mapStateToProps)(PortfolioSummary)