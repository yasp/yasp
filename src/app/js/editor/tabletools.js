if (typeof yasp === "undefed") yasp = { };

(function ()
{
  // From Shownotes-Editor (whose author is me, anyways..)
  // License: MIT
  // https://github.com/shownotes/shownoteseditor/blob/25b1b850e11d3cf8e80585e0e9ee055181e49061/demo/tabletools.js

  yasp.tabletools = { };

  yasp.tabletools.clear = function ($table)
  {
    var $tbody = $table.find('tbody:first');
    $tbody.empty();
  };

  yasp.tabletools.addRow = function ($table, data)
  {
    var $tbody = $table.find('tbody:first');
    var $tr = $('<tr>');

    for (var i = 0; i < data.length; i++)
    {
      var dat = data[i];
      var $td = $('<td>');

      if(typeof dat === "string")
      {
        $td.text(dat);
      }
      else if(dat.txt !== undefined && dat.cls !== undefined)
      {
        $td.text(dat.txt);
        $td.addClass(dat.cls);
      }
      else if(dat.cld !== undefined && dat.cls !== undefined)
      {
        $td.append(dat.cld);
        $td.addClass(dat.cls);
      }
      else
      {
        $td.append(dat);
      }

      $tr.append($td);
    }

    $tbody.append($tr);
    return $tr;
  };
})();