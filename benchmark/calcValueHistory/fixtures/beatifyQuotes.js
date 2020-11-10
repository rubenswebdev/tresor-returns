const quotes = require('./quotes.json')
const fs = require('fs')

async function start () {
  fs.writeFileSync('./quotesBeaty.json', JSON.stringify(quotes, null, 2))
}

start()
