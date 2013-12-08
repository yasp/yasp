if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.Language = {
    /**
     * Returns from an object the current language fields
     * {
     *  'en': "hello",
     *  'de': "hallo"
     * }
     * 
     * returns 'hello' if current language is english and return 'hallo' if current language is german.
     * 
     * @param lang
     * @returns {*}
     */
    getSpecificLanguage: function(lang) {
      switch(yasp.Storage["language"].toLowerCase()) {
        case "deutsch":
          return lang['de'];
          break;
        case "english":
        default:
          return lang['en'];
      }
    }
  };
})();


(function() {
  yasp.Localization = {
    // TODO
  }
})();