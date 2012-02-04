(function() {
  var mimeTypes = {
    'jpg': 'image/jpeg', 
    'png': 'image/png', 
    'gif': 'image/gif'
  };
  var lookupMime = function(fn) {
    ext = fn.split('.').pop();
    return mimeTypes[ext] || 'application/octet-stream';
  }
  var BookReader = function(element) {
    this.container = element;
    this.book = null;
    this.page = 0;
  };
  
  BookReader.prototype.setBook = function(book) {
    this.book = book;
    this.renderPage(0);
    this.page = 0;
  }

  BookReader.prototype.nextPage = function()
  {
    this.page++;
    this.renderPage(this.page);
  }
  
  BookReader.prototype.renderPage = function(idx) {
    if(!this.book) return;
    var cont = this.container;
    var book = this.book;
    this.book.fs.getXML(this.book.getPageUrl(idx), function(doc) {
      var p = new Page(book, doc);
      console.log(p);
      p.parsePage(function() {
        document.getElementById('pagestyles').innerHTML = p.css;
        cont.innerHTML = '';
        cont.appendChild(p.content);
      });
    });
  }




  var Page = function(book, xml) {
    this.book = book;
    this.xml = xml;
  }

  Page.prototype.parsePage = function(cb) {
    var that = this;
    var xml = this.xml;
    this.parseCSS(xml, function(css) {
      that.css = css;
      that.processHTML(xml, function(content) {
        that.content = content;
        cb();
      });
    });
  };

  Page.prototype.processHTML = function(doc, next) 
  {
      var imgTags = doc.getElementsByTagName('img');
      var book = this.book;
      var i = 0;
      function iterateImages() {
        if(i == imgTags.length) 
          return createContent();
        var url = book.baseUrl + '/' + imgTags[i].getAttribute('src').replace(/^\.\.\//, '');
        book.fs.getContent(url, function(data) {
          var file = book.fs.find(url).name;
          var mime = lookupMime(file);
          console.log(mime);
          data = data.replace(/^data:/, 'data:' + mime + ";");
          imgTags[i].setAttribute('src', data);
          i++;
          return iterateImages();
        }, 'uri');
      }

      function createContent() 
      {
        var body = doc.getElementsByTagName('body')[0];
        var newNode = document.createElement('div');
        newNode.className = body.className;
        newNode.innerHTML = body.innerHTML;
        next(newNode);
      }

      iterateImages();

  }

  Page.prototype.parseCSS = function(doc, next) 
  {
    var book = this.book;
    var cssTags = doc.getElementsByTagName('style');
    var linkTags = doc.getElementsByTagName('link');
    var css = '';

    for(var i=0;i<cssTags.length;i++) {
      css += cssTags[i].innerText.replace(/\s\s/, '') + "\n";
    }
    var i = 0;
    var itLinks = function() {
      if(i == linkTags.length) return next(css);
      while(!(linkTags[i].getAttribute('rel') == 'stylesheet')) i++;
      var url = book.baseUrl + '/' + linkTags[i].getAttribute('href').replace('../', '');       
      book.fs.getContent(url, function(txt) {
        css += txt.replace(/\s\s/, ' ') + "\n"; 
        i++;
        itLinks();
      });
    }

    itLinks();

  }

  if(!window.mit) { window.mit = { book: {} }; }
  if(!window.mit.book) { window.mit.book= {};  }
  window.mit.book.Reader = BookReader;
})();
