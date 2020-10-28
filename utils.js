const cloneDeep = require('lodash/cloneDeep')
const filter = require('lodash/filter')
const find = require('lodash/find')
const Big = require('big.js')
const {
  format,
  eachDayOfInterval,
  parse, isAfter
} = require('date-fns')

function applySplitMultiplier (activities) {
  activities = cloneDeep(activities)

  const splits = filter(
    filter(activities, a => a.type === 'split'),
    a => !isAfter(new Date(a.date), new Date())
  )

  // multiply all shares from activities <= split date with the split multiplier
  splits.forEach(s => {
    const activitiesBeforeSplit = filter(
      activities,
      (a) =>
        ['Buy', 'Sell'].includes(a.type) &&
        isAfter(new Date(s.date), new Date(a.date))
    )

    activitiesBeforeSplit.forEach(a => {
      a.shares = +Big(a.shares).times(Big(s.multiplier))
      a.price = +Big(a.price).div(Big(s.multiplier))
    })
  })

  return activities
}

function getDateArr (interval) {
  const startDate = new Date(parse(interval.start, 'yyyy-MM-dd', new Date()))
  const endDate = new Date(parse(interval.end, 'yyyy-MM-dd', new Date()))
  const eachDay = eachDayOfInterval({ start: startDate, end: endDate })

  const dateArr = eachDay.map((d, i) => format(d, 'yyyy-MM-dd'))

  return dateArr
}

function normalizeQuotes (quotes = [], dates) {
  let price = 0

  const quotesPerDay = []
  let alreadyFindPrice = false

  for (let i = 0; i < dates.length; i++) {
    const t = dates[i]

    // TODO: possible perf potential
    const q = find(quotes, x => x.date === t)

    if (q && q.price) {
      price = q.price

      if (!alreadyFindPrice) {
        quotesPerDay.slice(0, i).map(q => q.price = price);
        alreadyFindPrice = true
      }
    }

    quotesPerDay.push({
      date: t,
      price
    })
  }

  return quotesPerDay
}

function getPreviousValue (arr, i) {
  if (i === 0) {
    return arr.find(x => x != null)
  }

  const prev = arr[i - 1]

  if (prev === null) {
    return getPreviousValue(arr, i - 1)
  } else {
    return prev
  }
}

module.exports = {
  applySplitMultiplier,
  getDateArr,
  normalizeQuotes,
  getPreviousValue
}
