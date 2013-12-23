if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.l10n.getLangName = function () {
    var name = yasp.Storage["language"].toLowerCase();
    if(!yasp.l10n.lang[name])
      name = "en";
    return name;
  };
})();
