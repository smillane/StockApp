import mongoose from 'mongoose';
const { Schema } = mongoose;

// STOCKS
const stockQuote = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Object
})

const stockStatsBasic = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Object
})

const stockLargestTrades = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Object
})

const stockInsiderTrading = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Array
})

const stockPreviousDividends = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Array
})

const stockNextDividends = new Schema({
    symbol: String,
    nextUpdate: Number,
    lastUpdated: Number,
    docs: Object
})



// UPCOMING IPOs
const upcomingIPOs = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Object
})



// CRYPTO
const cryptoQuote = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Object
})



// TREASURIES
const treasuryQuote = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Object
})



// COMMODITIES
const commodityQuote = new Schema({
    symbol: String,
    lastUpdated: Number,
    docs: Object
})



// USER
const User = new Schema({
    username: String,
    uuid: String,
    userLists: { type: Map, of: Array }
})