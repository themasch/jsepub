(function() {

    var Book = function(fs) { 
      this.items = {};  
      this.pages = [];
      this.fs    = fs;
    };

    Book.prototype.addItem = function(id, url, type) {
      this.items[id] = { url: url, type: type };
    }

    Book.prototype.setPage = function(pg, id) {
      this.pages[pg] = id;
    }

    Book.prototype.getPageUrl = function(pg) {
      var id = this.pages[pg];
      return this.items[id].url;
    }

    if(!window.mit) { window.mit = { book: {} }; }
    if(!window.mit.book) { window.mit.book= {};  }
    window.mit.book.Book = Book;
})();

