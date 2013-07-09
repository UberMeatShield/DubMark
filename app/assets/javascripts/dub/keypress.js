
/** 
 * op - is the operation key, like shift etc
 * keyString - the string representation of the keycode
 * func - the function name on the actionInstance to run when the key is pressed
 */
DubMark.DefaultKeys = [ 
   {op: 'noOp', keyString: "j",  func: 'newSub'        , title: gT('NewSub')},
   {op: 'noOp', keyString: "k",  func: 'endSub'        , title: gT('EndSub')},
   {op: 'noOp', keyString: "l",  func: 'pauseAndEndSub', title: gT('PauseAndEndSub')},
   {op: 'noOp', keyString: "s",  func: 'setStart'      , title: gT('SetStart')},
   {op: 'noOp', keyString: "e",  func: 'setEnd'        , title: gT('SetEnd')},
   {op: 'noOp', keyString: " ",  func: 'togglePlay', title: gT('ToggleVideo')},

   {op: 'noOp', keyString: "t",  func: 'focusTranslation', title: gT('FocusTranslation')},
   {op: 'noOp', keyString: "f",  func: 'focusSource', title: gT('FocusSource')},

   //TODO also support arrow keys
   {op: 'noOp',    keyString: "n",  func: 'nextSub', title: gT('NextSub')},
   {op: 'noOp',    keyString: "h",  func: 'prevSub', title: gT('PrevSub')},
   {op: 'noOp',     keyString: "p",  func: 'toggleVideo', title: gT('ToggleVideo')},

   {op: 'ctrlKey', keyString: "j",  func: 'removeSub', title: gT('RemoveSub')},
   {op: 'shiftKey', keyString: "s",  func: 'jumpStart', title: gT('JumpSubStart')},
   {op: 'shiftKey', keyString: "e",  func: 'jumpEnd', title: gT('JumpSubEnd')}
];


DubMark.KeyPress = function(actionInstance){
  this.actions = actionInstance;
  this.init(); 
  this.listen();
};
$.extend(DubMark.KeyPress.prototype, {
  init: function(){
    this.setupCodes();

    this.listener = this.keyup.bind(this);
    window.document.addEventListener('keyup', this.listener, false);
  },
  setupCodes: function(cfg){
    var map = cfg && typeof cfg.UserKeyCfg == 'string' ? JSON.parse(cfg.UserKeyCfg) : DubMark.DefaultKeys;

    $.each(map, function(key, val){
      if(!val || !val.keyString || !val.func){return;}

      if(typeof this.actions[val.func] == 'function'){
        this.addEvt(
          val.keyString, 
          this.actions[val.func].bind(this.actions), 
          val.op || 'noOp'
        );
      }
    }.bind(this));

  },
  CODES: {  //Holds the actual functions that will be run per key
    noOp: {},
    ctrlKey:{},
    altKey:{},
    shiftKey: {}
  },
  isEnabled: function(){
    return this.enabled == 'On' ? 'active' : ''; 
  },
  getSetCallStack: function(keyString, op){//Get or empty init the calls stack for key presses
    op = op || 'noOp';
    if(typeof keyString == 'undefined') return; 
    var addTo = this.CODES;
    if(op){ //ctrlKey, etc.  Things you can detect on an event (only ctrl support right now)
      addTo = (this.CODES[op] = (this.CODES[op] || {}));
    }
    if(!addTo[keyString]){
     addTo[keyString] = [];
    }
    return addTo;
  },
  getCallStack: function(keyString, op){ //Get the keypress stack for a code and operaion(ie ctrl)
    op = op || 'noOp';
    if(typeof keyString == 'undefined') return; 
    var addTo = this.CODES;
    if(op && addTo[op]){ //ctrlKey, etc.  Things you can detect on an event (only ctrl support right now)
      addTo = addTo[op];
    }
    console.log("Get callstack", addTo, keyString, op, addTo[keyString]);
    return addTo[keyString];
  },
  addEvt: function(keyString, func, op/* optional: ie ctrlKey */){ //Add a function to the keypress evts
    var add = this.getSetCallStack(keyString, op, true);
    if(typeof func == 'function' && add) {
      add[keyString].push(func);
    } else{
      console.error('Invalid function or keyString provided (keyString, func, op)', keyString, func, op);
    }
  },
  replaceEvts: function(keyString, func, op){//Replace ALL events for a keycode and optional op+keyString
    var rep = this.getSetCallStack(keyString, op, true);
    if(rep && typeof func == 'function'){
      rep[keyString] = [func];
    }else{
      console.error('Could not replace the events with (keyString, func, op)', keyString, func, op);
    }
  },
  removeEvts: function(keyString, op){//Remove all events for a keycode and optionally op+keyString
    var rm = this.getCallStack(keyString, op);
    if(rm){
      rm[keyString] = null;
    }
  },
  getKeyString: function(keyCode){
    var str = String.fromCharCode(keyCode);
    if(!str){
      str = keyCode;
    }else{
      str = str.toLowerCase();
    }
    return str;
  },
  runEvents: function(evt, keyString, op){//Run all the events associated with a key, op
    var run = this.getCallStack(keyString, op);
    for (var i in run){
      var func = run[i];
      if(typeof func == 'function'){
        func(keyString, evt);
      }
    }
    //stop event?
  },
  keyup: function(evt){ 
    try{
      evt = evt || window.event;
      if(evt.keyCode == 27){
        this.actions.keypressToggle();
        return;
      }
      if(this.enabled != 'On'){
        return;
      }
      //Stop listening for events on an esc key, this is annoying to trigger the angular change event?
      var op = evt.ctrlKey  ? 'ctrlKey'  : null; //Make this smarter
          op = evt.shiftKey ? 'shiftKey' : op;
          op = evt.altKey   ? 'altKey'   : op;
          op = op || 'noOp';

      var keyString = this.getKeyString(evt.keyCode);
      this.runEvents(evt, keyString, op);
    }catch(e){
      console.error("Failed to handle a key event (evt, e)", e);
    }
  },
  listen: function(target){ 
    this.enabled = 'On';
  },
  sleep: function(target){//Stop paying attention to keypress events on the widget
    this.enabled = 'Off';
  },
  bindUnfocus: function(){//This seems a bit hacky..
    if(!this._bodyClick){
      this._bodyClick = function(){ 
        var w = this.getWidget();
        if(w){
          w.unfocus();
        }
      }.bind(this);
      document.body.onclick = this._bodyClick;
    }
  },
  toggle: function(){
    this.enabled == 'On' ? this.sleep()  : this.listen();
  }
});
