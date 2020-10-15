const filter = require('lodash/filter')
const reduce = require('lodash/reduce')

const Big = require('big.js')

module.exports = function calcCurrentShares (activities) {
  if (activities.length === 0) {
    return 0
  }

  const purchases = filter(activities, a => a.type === 'Buy')
  const sales = filter(activities, a => a.type === 'Sell')

  const zero = Big(0)
  const purchased =
    reduce(purchases, (sum, p) => Big(p.shares).plus(sum), zero) || zero

  const sold = reduce(sales, (sum, p) => Big(p.shares).plus(sum), zero) || zero

  return +purchased.minus(sold)
}
