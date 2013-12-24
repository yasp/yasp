if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.l10n.getLangName = function () {
    var name = yasp.Storage["language"].toLowerCase();
    if(!yasp.l10n.lang[name])
      name = "en";
    return name;
  };

  yasp.l10n.getTranslation = function (key, params) {
    params = params || [];

    var lang = yasp.l10n.getLangName();
    var str = yasp.l10n.lang[lang][key];
    for (var i = 0; i < params.length; i++) {
      str = str.replace("{" + i + "}", params[i]);
    }
    if(!str) {
      console.log("l10n: could not find string for " + key);
      str = "";
    }
    return str;
  };

  yasp.l10n.translateDocument = function () {
    var $elements = $('[data-l10n]');
    for (var i = 0; i < $elements.length; i++) {
      var $element = $elements[i];
      yasp.l10n.translateSingleDomElement($element);
    }
  };

  yasp.l10n.translateSingleDomElement = function (element) {
    var $element = $(element);
    var key = $element.attr('data-l10n');
    if(key) {
      var params = [];

      for (var i = 0;; i++) {
        var par = $element.attr('data-l10n-p' + i);
        if(!par)
          break;
        params.push(par);
      }

      var str = yasp.l10n.getTranslation(key, params);
      $element.text(str);
    }
  };
})();
