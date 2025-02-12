(function () {
  function loadScript(src, type, attributes) {
    return new Promise(function (resolve) {
      var script = document.createElement('script');

      function onLoaded() {
        if (script.parentElement) {
          script.parentElement.removeChild(script);
        }

        resolve();
      }

      script.src = src;
      script.onload = onLoaded;

      if (attributes) {
        attributes.forEach(function (att) {
          script.setAttribute(att.name, att.value);
        });
      }

      script.onerror = function () {
        console.error('[polyfills-loader] failed to load: ' + src + ' check the network tab for HTTP status.');
        onLoaded();
      };

      if (type) script.type = type;
      document.head.appendChild(script);
    });
  }

  var polyfills = [];

  if (!('fetch' in window)) {
    polyfills.push(loadScript('./polyfills/fetch.js'));
  }

  if (!('noModule' in HTMLScriptElement.prototype) || 'foo' in bar) {
    polyfills.push(loadScript('./polyfills/systemjs.js'));
  }

  function loadFiles() {
    if (!('noModule' in HTMLScriptElement.prototype)) {
      [function () {
        return System.import('./legacy/app-1.js');
      }, function () {
        return loadScript('./legacy/app-2.js', null, []);
      }].reduce(function (a, c) {
        return a.then(c);
      }, Promise.resolve());
    } else if ('foo' in bar) {
      [function () {
        return loadScript('./foobar/app-1.js', null, []);
      }, function () {
        return System.import('./foobar/app-2.js');
      }].reduce(function (a, c) {
        return a.then(c);
      }, Promise.resolve());
    } else {
      [function () {
        return loadScript('./app-1.js', 'module', []);
      }, function () {
        return loadScript('./app-2.js', null, []);
      }].reduce(function (a, c) {
        return a.then(c);
      }, Promise.resolve());
    }
  }

  if (polyfills.length) {
    Promise.all(polyfills).then(loadFiles);
  } else {
    loadFiles();
  }
})();