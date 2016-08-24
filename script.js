var request = require('request');
var parseString = require('xml2js').parseString;
var drawHist = require('./histogram.js');

var key = "jWA0Q2gjchUnT2wnfmpdQ";
var id = "27312321"
var url = `https://www.goodreads.com/user/show/${id}.xml?key=${key}`;

var log = _ => console.log(_);

function getToReadShelf(page, books, whenDone) {
  var booksPerPage = 200; // max is 200
  var url = `https://www.goodreads.com/review/list?v=2&id=${id}&key=${key}&shelf=to-read&per_page=${booksPerPage}&page=${page}`;
  request(url, function (error, response, body) {
    var xml = body;
    parseString(xml, function (err, result) {
      var total = result.GoodreadsResponse.reviews[0]['$'].total;
      var end = result.GoodreadsResponse.reviews[0]['$'].end;
      var bookObjs = result.GoodreadsResponse.reviews[0].review;
      var newBooks = bookObjs.map(book => {
        book = book.book[0];
        return {
          title: book.title[0],
          isbn: book.isbn[0],
          link: book.link[0],
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
    stats.forEach(stat => {
      var book = books.filter(_ => _.isbn === stat.isbn)[0];
      book.nRatings = stat.work_ratings_count;
      book.average_rating = parseFloat(stat.average_rating);
      delete book.isbn;
      withStats.push(book);
    });
    whenDone(withStats);
  });
}

function output(books, minNumRatings) {
    log(`Books from your To-Read Shelf with at least ${minNumRatings} ratings, highest rated first.\n`);
    log('|Title|Average Rating|Histogram|Number of Ratings|');
    log('|---|---|---|---|')
    books.forEach(book => {
      log(`|[${book.title}](${book.link})|${book.average_rating}|![${book.title}](hists/${book.title}.png)|${book.nRatings}|`);
    })
}

function getHistData(books, index, whenDone) {
  request(books[index].link, function (error, response, body) {
    var results = body.match(/(\d+)% \(\d+\)/g);
    var values = results
      .slice(0, 5)
      .map(_ => _.split('%')[0])
      .map(_ => parseInt(_));
    values.reverse();
    drawHist({values: values, filename: `hists/${books[index].title}.png`});

    if (index === books.length - 1) {
      whenDone(books);
    } else {
      getHistData(books, index + 1, whenDone);
    }

  });
}

getToReadShelf(1, [], books => {
  booksWithStats(books, books => {
    var minNumRatings = 100;
    books = books.filter(_ => _.nRatings >= minNumRatings)
                       .sort((a, b) => b.average_rating - a.average_rating);
    getHistData(books, 0, books => {
      output(books, minNumRatings);
    })
  });
});

