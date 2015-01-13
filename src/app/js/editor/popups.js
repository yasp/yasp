(function() {
  yasp.Editor.popups = {
    init: function () {
      var $popups = $('#popups > *');
      var hiddenPopus = JSON.parse(yasp.Storage['hiddenPopups']);

      for (var i = 0; i < $popups.length; i++) {
        var $popup = $($popups[i]);
        if(hiddenPopus.indexOf($popup.attr('data-name')) === -1)
          $popup.addClass('shown');
      }

      $popups.find('.hideNow').click(function (e) {
        var $popup = $(e.target).parents('.popup');
        $popup.css('display', 'none');
      });
      $popups.find('.hideAlways').click(function (e) {
        var $popup = $(e.target).parents('.popup');
        $popup.css('display', 'none');

        var hiddenPopus = JSON.parse(yasp.Storage['hiddenPopups']);
        hiddenPopus.push($popup.attr('data-name'));
        yasp.Storage['hiddenPopups'] = JSON.stringify(hiddenPopus);
      });
    }
  }
})();