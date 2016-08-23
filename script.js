var request = require('request');
var parseString = require('xml2js').parseString;

var key = "jWA0Q2gjchUnT2wnfmpdQ";
var id = "27312321"
var url = "https://www.goodreads.com/user/show/" + id  +".xml?key=" + key;

function f (obj, prop) {
  console.log(obj[prop]);
  return obj[prop];
}

var log = _ => console.log(_);

function noop() {}
function sleep(msec) {
  setTimeout(noop, msec);
}

function getToReadShelf(page, isbns, whenDone) {
  var url = "https://www.goodreads.com/review/list?v=2&id=" + id + 
    "&key=" + key + "&shelf=to-read&per_page=20&page=" + page;
  request(url, function (error, response, body) {
    var xml = body;
    parseString(xml, function (err, result) {
      var books = result.GoodreadsResponse.reviews[0].review;
      var newISBNs = books.map(_ => _.book[0].isbn[0]);
      
      isbns = isbns.concat(newISBNs)

      if (page == 3) {
        whenDone(isbns);
      } else {
        getToReadShelf(page + 1, isbns, whenDone)
      }

    });
  });
}

getToReadShelf(1, [], function(isbns) {log(isbns)})

