Front end for Stock app for displaying various market information.

Backend located https://github.com/smillane/StockAppBackend

Work in progress.

add SEC documents using edgar

if query not found, add logic to not save to db, and return 404 not found page.

https://iexcloud.io/docs/api/#u-s-holidays-and-trading-dates just create dict with those dates?

https://iexcloud.io/docs/api/#list create endpoint for mostactive, gainers, losers

Add logic for if nothing found in db, populate with last 4, 8, etc for endpoints such as past dividends, insider transactions