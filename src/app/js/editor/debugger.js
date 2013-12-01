if (typeof yasp == 'undefined') yasp = { };

(function() {
  var updateInterval;
  var debuggerEditor;
  var hw_led_green, hw_led_yellow, hw_led_red;
  var hw_but_black, hw_but_red;
  
  $('body').ready(function() {
    debuggerEditor = yasp.EditorManager.create($('#debugger_editor').get(0));
    debuggerEditor.swapDoc(yasp.EditorManager.editors[0].linkedDoc({
      sharedHist: true
    }));
    debuggerEditor.setOption('readOnly', "nocursor");
    
    // initialize hardware
    hw_but_red = new yasp.Hardware({
      cb: function(button) { },
      container: $('#hw_but_red'),
      type: yasp.HardwareType.PUSHBUTTON,
      params: {
        color: 'rgb(255,0,0)',
        pushcolor: 'rgb(180,0,0)'
      }
    });

    hw_but_black = new yasp.Hardware({
      cb: function(button) { },
      container: $('#hw_but_black'),
      type: yasp.HardwareType.PUSHBUTTON,
      params: {
        color: 'rgb(100,100,100)',
        pushcolor: 'rgb(60,60,60)'
      }
    });
  });
  
  
  
  yasp.Debugger = {
    show: function() {
      $('#dialog_debugger').modal({
        'keyboard': true
      });
      updateInterval || (updateInterval = setInterval(function() {
        var height = $('#dialog_debugger .modal-content').height();
        $('#debugger_table').css({
          "height": (height-200)+"px"
        });

        debuggerEditor.refresh();
      }, 10)); // weird hack for CodeMirror & size adjustment
    }
  };
})();

