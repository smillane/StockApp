import { mongoose } from "mongoose";

// add logic to update certain queries multiple data points such as dividends (last 4) or insider transactions (last 6 or 8?)

// for queries that will be updated every 5 minutes
export function updateAndReplace(symbol, query, basicQuoteBool, onceDailyBool) {
  if (!dbQueryExistsCheck(symbol, query, Model)) { 
    returnNotFound(); 
  }

  const Model = CreateMongooseModel(query);
  const docsFromDb = getDocsFromDb(symbol, Model);

  if (onceDailyBool) {
    updateOnceADayQuery(symbol, query, Model, docsFromDb);
  }

  if (basicQuoteBool) {
    const startUpdatePeriod = "7:00";
    const endtUpdatePeriod = "20:00";
  }
  if (!basicQuoteBool) {
    const startUpdatePeriod = "9:30";
    const endtUpdatePeriod = "16:00";
  }  

  if (!lastUpdateQuery(docsFromDb, startUpdatePeriod, endtUpdatePeriod)) {
    return docsFromDb.docs;
  }

  const docsFromAPI = apiQuery(query, symbol).data;
  updateDocsInDB(docsFromAPI, query, symbol, Date.now(), Model);
  return docsFromAPI.body;
}

// for queries that will be updated and added to previous docs
export function updateOnIntervalsAndAdd(symbol, query, nextSymbol, nextQuery) {
  const Model = CreateMongooseModel(query);

  if (!dbQueryExistsCheck(symbol, query, Model)) {
    returnNotFound();
  }

  const docsFromDb = getDocsFromDb(symbol, Model);

  updateNext(symbol, query, docsFromDb, nextSymbol, nextQuery);
}

// for functions that will not directly be updated, such as dividends
export function findAndReturn(symbol, query) {
  const Model = CreateMongooseModel(query);

  if (!dbQueryExistsCheck(symbol, query, Model)) {
    returnNotFound();
  }

  return getDocsFromDb(symbol, Model).docs;
}



//create mongoose model for queries,updates, etc
function CreateMongooseModel(query) {
  return mongoose.model(query, `${query}Schema`);
}

function getDocsFromDb(symbol, model) {
  return model.find({ symbol: symbol });
}

// check if query is in db, if it's not, check API, if doesn't exist, return 404, symbol is not supported
function dbQueryExistsCheck(symbol, model) {
  if (!model.exists({ 'symbol': symbol }).exec()) {
    console.log(symbol)
    apiStatusCheck(apiQuery(stockQuote, symbol).statusCode);
  }
  return true;
}

// update db docs
async function updateDocsInDB(docs, query, symbol, inputTime, queryModel) {
  const res = await queryModel.updateOne({ symbol: symbol }, { lastUpdated: inputTime, docs: docs }, { upsert: true });
  console.log(res.acknowledged);
  console.log(res.upsertedId);
}

function dbUpdateList(symbol, query, Model, docsFromDb, lastUpdatedUnixTime) {
  // ?from={CURRENT DATE}}&limit=(probably 10 or 15?, can adjust based off API usage, 
  // don't want too small, but don't want too big incase it hasn't been updated in a while)
  const docsFromAPI = apiQuery(query, symbol, docs.lastUpdated).data;
  const res = await Model.updateOne({ symbol: symbol }, { lastUpdated: lastUpdatedUnixTime, $push: { docs: docsFromAPI } } );
  console.log(res.acknowledged);
  console.log(res.upsertedId);
  return getDocsFromDb(symbol, Model);
}

// add docs to array in db
// maybe use addToSet?
// The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.
async function addDocsInDB(docs, query, symbol, inputTime) {
  const queryModel = CreateMongooseModel(query);
  const res = await queryModel.updateOne({ symbol: symbol }, { lastUpdated: inputTime, $push: { docs: docs } } )
  console.log(res.acknowledged);
  console.log(res.upsertedId);
}

// checking to see when db was last updated for certain information
// if it's been updated between Friday 4:06pm and Monday 9:29AM, don't do anything 
// if it's after M/T/W/R 4:06PM and has been updated, don't do anything
// if it's before T/W/R/F 9:30AM and has been updated, don't do anything
// otherwise, if it's been more than 5 minutes since it's been updated, call api, update db, return data
function updatedLessThanFiveMinutesCheck(dbLastUpdated) {
  const lastUpdatedToNow = differenceInSeconds(formatDistanceToNowStrict(dbLastUpdated.lastUpdated, { includeSeconds: true, addSuffix: true }))
  if (lastUpdatedToNow <= 300) {
    return false;
  }
  return true;
}
    
// need to do a check for basic quote, which will update max of every 5 mins, til 8pm, and other queries which will stop updating at 4:06pm
// endUpdatePeriod = 8pm for basicQuote Mon-Thurs or 4:05pm for the rest of stock info
// startUpdatePeriod = 7am for basicQuote, or 9:30 for rest of stock info, commodities, and treasuries
// crypto will update every 5 mins
function lastUpdateQuery(docs, startUpdatePeriod, endtUpdatePeriod) {  
  const lastUpdatedUnixTime = fromUnixTime(docs.lastUpdated);
  const weekends = ['Sat', 'Sun']
  if (weekends.includes(lastUpdatedUnixTime)) {
    return false;
  }

  const weekdays = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri']
  if (weekdays.includes(lastUpdatedUnixTime)) {
    if (endtUpdatePeriod >= docs.lastUpdated.getHours() >= startUpdatePeriod) {
      return false;
    }
    updatedLessThanFiveMinutesCheck(docs.lastUpdated);
  }
  return true;
}
    
// need to do a check for basic quote, which will update max of every 5 mins, til 8pm, and other queries which will stop updating at 4:06pm
// endUpdatePeriod = 8pm for basicQuote Mon-Thurs or 4:05pm for the rest of stock info
// startUpdatePeriod = 7am for basicQuote, or 9:30 for rest of stock info, commodities, and treasuries
// crypto will update every 5 mins
function updateOnceADayQuery(symbol, query, Model, docsFromDb) {  
  const lastUpdatedUnixTime = fromUnixTime(docsFromDb.lastUpdated);
  const formatedLastUpdateCheck = parseInt(formatDistanceToNowStrict(docs.lastUpdated.getHours(), {unit: 'hour'}.split(" ")))
  
  if (formatedLastUpdateCheck > 12){
    const weekends = ['Sat', 'Sun']
    if (weekends.includes(lastUpdatedUnixTime)) {
      return docsFromDb.data;
    }

    const weekdays = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri']
    if (weekdays.includes(lastUpdatedUnixTime)) {
      dbUpdateList(symbol, query, Model, docsFromDb, lastUpdatedUnixTime);
    }
  }
  return docsFromDb.data;
}

// checking to see if data to be periodically (monthly/quartly/yearly... etc...) needs to be updated. 
// Input will be string from db doc that has been parsed
// change variable names to something along the lines off, addNewDocToStack
// EXAMPLE
// will add nextDividend to previousDividends, once date passes and there is a new nextDividend
// will then query the new nextDividend, and update nextDividend endpoint in db
function updateNext(symbol, query, docs, listOfPreviousQuery) {
  const inputUnixTime = fromUnixTime(docs.nextUpdate);
  const formatedLastUpdateCheck = parseInt(formatDistanceToNowStrict(docs.lastUpdated.getHours(), {unit: 'hour'}.split(" ")))

  if (isPast(inputUnixTime) && formatedLastUpdateCheck > 24) {
    const currentTime = Date.now()
    addDocsInDB(docs, listOfPreviousQuery, symbol, currentTime);
    const docsFromAPI = apiQuery(query, symbol).data;
    updateDocsInDB(docsFromAPI, query, symbol, currentTime);
    return docsFromAPI.body;
  }
  return docs.docs;
}

// query api, and return data
function apiQuery(query, symbol, nextN) {
  return fetch(query(symbol, nextN));
}
  
// res.headers('HTTP/2') or res.statusCode
// unsure on the .statusCode for nextjs
// check api status, if it's not between 200 and 209, return notFound: true, which sends a 404 page
// look into customizing this later for response
// add logging for header response to see on backend
function apiStatusCheck(statusCode) {
  if (statusCode >= 300 || statusCode < 200) {
    console.log(statusCode);
    return false;
  }
  return true;
}



// return notFound: true to return a 404 error page
function returnNotFound() {
  return {
    notFound: true
  }
}