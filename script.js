var request = require('request');
var parseString = require('xml2js').parseString;

var key = "jWA0Q2gjchUnT2wnfmpdQ";
var id = "27312321"
var url = `https://www.goodreads.com/user/show/${id}.xml?key=${key}`;

var log = _ => console.log(_);

function getToReadShelf(page, books, whenDone) {
  var booksPerPage = 1; // max is 200
  var url = `https://www.goodreads.com/review/list?v=2&id=${id}&key=${key}&shelf=to-read&per_page=${booksPerPage}&page=${page}`;
  request(url, function (error, response, body) {
    var xml = body;
    parseString(xml, function (err, result) {
      var total = result.GoodreadsResponse.reviews[0]['$'].total;
      var end = result.GoodreadsResponse.reviews[0]['$'].end;
      var bookObjs = result.GoodreadsResponse.reviews[0].review;
      var newBooks = bookObjs.map(function(book) {
        book = book.book[0];
        return {
          title: book.title[0],
          isbn: book.isbn[0],
        };
      });
      books = books.concat(newBooks);
      if (total === end) {
        whenDone(books);
      } else {
        getToReadShelf(page + 1, books, whenDone)
      }
    });
  });
}

function booksWithStats(books, whenDone) {
  var url = `https://www.goodreads.com/book/review_counts.json?key=${key}&isbns=${books.map(_ => _.isbn).join(',')}`;
  request(url, function (error, response, body) {
    var stats = JSON.parse(body).books;
    var withStats = [];
    for (var i in stats) {
      var stat = stats[i];
      var book = books.filter(_ => _.isbn === stat.isbn)[0];
      book.nRatings = stat.work_ratings_count;
      book.average_rating = parseFloat(stat.average_rating);
      delete book.isbn;
      withStats.push(book);
    }
    whenDone(withStats);
  });
}

getToReadShelf(1, [], function(books) {
  booksWithStats(books, function(books) {
    var minNumRatings = 100;
    var results = books.filter(_ => _.nRatings >= minNumRatings)
                       .sort((a, b) => b.average_rating - a.average_rating);
    log("Books with at least " + minNumRatings + " ratings");
    log(results)
  });
});

