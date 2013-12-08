if (typeof yasp == 'undefined') yasp = { };

(function() {
  var updateInterval;
  var debuggerEditor;
  var hw_led_green, hw_led_yellow, hw_led_red;
  var hw_but_black, hw_but_red;
  
  var hardware = [ ];
  
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
    hardware.push(hw_but_red);

    hw_but_black = new yasp.Hardware({
      cb: function(button) { },
      container: $('#hw_but_black'),
      type: yasp.HardwareType.PUSHBUTTON,
      params: {
        color: 'rgb(100,100,100)',
        pushcolor: 'rgb(60,60,60)'
      }
    });
    hardware.push(hw_but_black);

    hw_led_green = new yasp.Hardware({
      cb: function(button) { },
      container: $('#hw_led_green'),
      type: yasp.HardwareType.LED,
      params: {
        onColor: 'rgb(0,255,0)',
        offColor: 'rgb(0,60,0)'
      }
    });
    hardware.push(hw_led_green);
    
    hw_led_yellow = new yasp.Hardware({
      cb: function(button) { },
      container: $('#hw_led_yellow'),
      type: yasp.HardwareType.LED,
      params: {
        onColor: 'rgb(255,255,0)',
        offColor: 'rgb(60,60,0)'
      }
    });
    hardware.push(hw_led_yellow);
    
    hw_led_red = new yasp.Hardware({
      cb: function(button) { },
      container: $('#hw_led_red'),
      type: yasp.HardwareType.LED,
      params: {
        onColor: 'rgb(255,0,0)',
        offColor: 'rgb(60,0,0)'
      }
    });
    hardware.push(hw_led_red)
    
    hw_led_green.receiveStateChange(yasp.HardwareType.LED.States.OFF);
    hw_led_red.receiveStateChange(yasp.HardwareType.LED.States.OFF);
    hw_led_yellow.receiveStateChange(yasp.HardwareType.LED.States.OFF);
    
    hw_poti = new yasp.Hardware({
      cb: function(button) { },
      container: $('#hw_poti'),
      type: yasp.HardwareType.POTI,
      params: 0
    });
  });
  
  
  yasp.Debugger = {
    show: function() {
      $('#dialog_debugger').modal({
        'keyboard': true
      }).on('shown.bs.modal', function() {
        // redraw hardware
        for (var i = 0; i < hardware.length; i++) {
          hardware[i].render();
        }
        
        // load code into emulator
        yasp.EmulatorCommunicator.sendMessage("LOAD", {
          bitcode: yasp.Editor.bitcode,
          start: 0
        }, function() {
          yasp.EmulatorCommunicator.sendMessage("CONTINUE", {
            count: null
          });
        });
        
      }).on('hidden.bs.modal', function() {
        // stop execution
        yasp.EmulatorCommunicator.sendMessage("BREAK", { });
      });
      
      var updateFunc;
      updateInterval || (updateInterval = setInterval(updateFunc = function() {
        var height = $('#dialog_debugger .modal-content').height();
        $('#debugger_table').css({
          "height": (height-200)+"px"
        });

        debuggerEditor.refresh();
      }, 250)); // weird hack for CodeMirror & size adjustment
      
      setTimeout(updateFunc, 10);
    }
  };
})();

