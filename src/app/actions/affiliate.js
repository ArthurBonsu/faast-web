import { newScopedCreateAction, idPayload } from 'Utilities/action'
import log from 'Log'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import Faast from 'Services/Faast'
import { sessionStorageSet, sessionStorageSetJson, sessionStorageGetJson, 
  sessionStorageGet, sessionStorageClear } from 'Utilities/storage'

import { isAffiliateLoggedIn } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const login = createAction('LOGIN')
export const logout = createAction('LOGOUT')
export const loginError = createAction('LOGIN_ERROR')
export const updateAffiliateId = createAction('UPDATE_ID')
export const updateSecretKey = createAction('UPDATE_KEY')
export const updateBalance = createAction('UPDATE_BALANCE')
export const updateBalanceSwaps = createAction('UPDATE_BALANCE_SWAPS')
export const resetAffiliate = createAction('RESET_ALL')
export const statsRetrieved = createAction('STATS_RETRIEVED')
export const withdrawalsRetrieved = createAction('WITHDRAWALS_RETRIEVED')
export const swapsRetrieved = createAction('SWAPS_RETRIEVED')
export const swapsError = createAction('SWAPS_RETRIEVED')
export const statsError = createAction('STATS_ERROR')
export const withdrawalsError = createAction('WITHDRAWALS_ERROR')

export const getStats = (id, key) => (dispatch, getState) => {
  return Faast.getAffiliateStats(id, key)
    .then(({ totals, affiliate_id }) => {
      sessionStorageSet('state:affiliate_id', affiliate_id)
      sessionStorageSet('state:affiliate_key', key)
      sessionStorageSetJson('state:affiliate_stats', totals)
      dispatch(updateAffiliateId(id))
      dispatch(updateSecretKey(key))
      dispatch(statsRetrieved(totals))
      return dispatch(dispatch(login()))
    })
    .catch((e) => { 
      if (!isAffiliateLoggedIn(getState())) {
        dispatch(loginError())
        toastr.error('Affiliate ID or Secret Key is incorrect')
      }
      dispatch(statsError(e))
    })
}

export const affiliateLogin = (id, key) => (dispatch) => {
  dispatch(getAffiliateWithdrawals(id, key))
  dispatch(getAffiliateSwaps(id))
  dispatch(getBalance(id, key))
  dispatch(getStats(id, key))
}

export const getBalance = (id, key) => (dispatch, getState) => {
  return Faast.getAffiliateBalance(id, key)
    .then(({ balance, swaps }) => {
      sessionStorageSet('state:affiliate_balance', balance)
      sessionStorageSet('state:affiliate_balance_swaps', swaps)
      dispatch(updateBalance(balance))
      return dispatch(updateBalanceSwaps(swaps))
    })
    .catch(() => { 
      if (!isAffiliateLoggedIn(getState())) {
        dispatch(loginError())
      }
    })
}

export const getAffiliateWithdrawals = (id, key) => (dispatch) => {
  return Faast.getAffiliateSwapPayouts(id, key)
    .then((withdrawals) => {
      sessionStorageSetJson('state:affiliate_withdrawals', withdrawals.records)
      return dispatch(withdrawalsRetrieved(withdrawals.records))
    })
    .catch((e) => dispatch(withdrawalsError(e)))
}

export const getAffiliateSwaps = (id) => (dispatch) => {
  return Faast.getAffiliateSwaps(id)
    .then((swaps) => {
      sessionStorageSetJson('state:affiliate_swaps', swaps)
      return dispatch(swapsRetrieved(swaps))
    })
    .catch((e) => dispatch(swapsError(e)))
}

export const restoreCachedAffiliateInfo = () => (dispatch) => {
  const cachedAffiliateId = sessionStorageGet('state:affiliate_id')
  const cachedAffiliateKey = sessionStorageGet('state:affiliate_key')
  const cachedAffiliateStats = sessionStorageGetJson('state:affiliate_stats')
  const cachedAffiliateWithdrawals = sessionStorageGetJson('state:affiliate_withdrawals')
  const cachedAffiliateSwaps = sessionStorageGetJson('state:affiliate_swaps')
  const cachedAffiliateBalance = sessionStorageGetJson('state:affiliate_balance')
  const cachedAffiliateBalanceSwaps = sessionStorageGetJson('state:affiliate_balance_swaps')
  if (cachedAffiliateId && cachedAffiliateStats && cachedAffiliateWithdrawals 
    && cachedAffiliateKey && cachedAffiliateBalance && cachedAffiliateBalanceSwaps && cachedAffiliateSwaps) {
    dispatch(updateAffiliateId(cachedAffiliateId))
    dispatch(statsRetrieved(cachedAffiliateStats))
    dispatch(withdrawalsRetrieved(cachedAffiliateWithdrawals))
    dispatch(swapsRetrieved(cachedAffiliateSwaps))
    dispatch(updateSecretKey(cachedAffiliateKey))
    dispatch(updateBalance(cachedAffiliateBalance))
    dispatch(updateBalanceSwaps(cachedAffiliateBalanceSwaps))
    dispatch(dispatch(login()))
  } else {
    dispatch(affiliateLogout())
  }
  return
}

export const affiliateLogout = () => (dispatch) => {
  sessionStorageClear()
  dispatch(resetAffiliate())
  dispatch(dispatch(logout()))
  return dispatch(push('/affiliates/login'))
}

export const register = (id, address, email) => (dispatch) => {
  return Faast.affiliateRegister(id, address, email)
    .then(({ affiliate_id, secret }) => {
      dispatch(affiliateLogin(affiliate_id, secret))
      return dispatch(push('/affiliates/dashboard/account'))
    })
    .catch(() => toastr.error('There was an error registering. Please try again.'))
}