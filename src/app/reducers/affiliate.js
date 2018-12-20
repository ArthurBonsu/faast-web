import { createReducer } from 'redux-act'
import { pick } from 'lodash'
import { statsRetrieved, statsError, login, swapsRetrieved, swapsError, loginError,
  updateAffiliateId, updateSecretKey, resetAffiliate, logout, updateBalance, updateBalanceSwaps,
  withdrawalsRetrieved, withdrawalsError
} from 'Actions/affiliate'
import { toBigNumber, ZERO } from 'Utilities/convert'
import { createUpserter, createUpdater, mapValues } from 'Utilities/helpers'

const initialState = {
  loggedIn: false,
  balance: undefined,
  swapCount: undefined,
  affiliate_id: '',
  secret_key: '',
  loginError: false,
  swapsError: '',
  statsError: '',
  stats: {},
  swaps: {},
  withdrawals: {},
  withdrawalsError: '',
}

const upsert = createUpserter('stats', initialState)
const update = createUpdater('stats')

export default createReducer({
  [login]: (state) => ({ ...state, loggedIn: true, loginError: false }),
  [logout]: (state) => ({ ...state, loggedIn: false, loginError: false }),
  [loginError]: (state) => ({ ...state, loggedIn: false, loginError: true }),
  [updateAffiliateId]: (state, id) => ({ ...state, affiliate_id: id }),
  [updateBalance]: (state, balance) => ({ ...state, balance }),
  [updateBalanceSwaps]: (state, swaps) => ({ ...state, swapCount: swaps }),
  [updateSecretKey]: (state, key) => ({ ...state, secret_key: key }),
  [statsRetrieved]: (state, stats) => ({ 
    ...state,
    statsError: '',
    stats: { ...stats }
  }),
  [statsError]: (state, error) => ({ ...state, statsError: error }),
  [swapsRetrieved]: (state, swaps) => ({ 
    ...state,
    swapsError: '',
    swaps: { ...swaps }
  }),
  [withdrawalsRetrieved]: (state, withdrawals) => ({ 
    ...state,
    withdrawalsError: '',
    withdrawals: { ...withdrawals }
  }),
  [withdrawalsError]: (state, error) => ({ ...state, withdrawalsError: error }),
  [swapsError]: (state, error) => ({ ...state, swapsError: error }),
  [resetAffiliate]: () => initialState
}, initialState)
