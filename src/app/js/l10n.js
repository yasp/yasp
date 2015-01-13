if (typeof yasp == 'undefined') yasp = { };

(function() {
  if (!yasp.l10n) {
    /** Additional documentation can be found in the {@link https://github.com/yasp/yasp/blob/master/doc/l10n.md|GitHub repository}.
     * @class
     */
    yasp.l10n = {};
  }

  /** returns the name of the currently selected language
   */
  yasp.l10n.getLangName = function () {
    var name = (yasp.Storage["language"] || "").toLowerCase();
    if(!yasp.l10n.lang[name])
      name = "en";
    return name;
  };

  /** translates a single key and replaces placeholders (`{0}`) with values given in the params-parameter.
   * @param {String} key the key to translate
   * @param {String[]=} params the parameters to put in the translated string
   */
  yasp.l10n.getTranslation = function (key, params) {
    params = params || [];

    var lang = yasp.l10n.getLangName();
    var str = yasp.l10n.lang[lang][key];
    if(!str) {
      console.log("l10n: could not find string for " + key);
      str = key;
    }
    for (var i = 0; i < params.length; i++) {
      str = str.replace("{" + i + "}", params[i]);
    }
    return str;
  };

  /** translates the whole DOM recursively
   * @see yasp.l10n#translateSingleDomElement
   */
  yasp.l10n.translateDocument = function () {
    var $elements = $('[data-l10n]');
    for (var i = 0; i < $elements.length; i++) {
      var $element = $elements[i];
      yasp.l10n.translateSingleDomElement($element);
    }
  };

  /** translates a DOM-Element using the key given in its data-l10n attribute.
   * @param element {object} the DOM-Element to translate
   * @see yasp.l10n#translateDocument
   */
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
      if($element.attr('data-l10n-html') === "true")
        $element.html(str);
      else
        $element.text(str);
    }
  };
})();
