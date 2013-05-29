DubMark.KeyPress = function(project){
  this.project = project;
  this.init(); 

  this.enabled = true;
};
$.extend(DubMark.KeyPress.prototype, {
  init: function(){
    if(this.project){
      this.listen();
    }
  },
  CODES: { 
    ctrlKey:{
    },
    altKey:{
    },
    shiftKey: {
    },
  },
  getSetCallStack: function(keyCode, op){//Get or empty init the calls stack for key presses
    if(typeof keyCode == 'undefined') return; 
    var addTo = this.CODES;
    if(op){ //ctrlKey, etc.  Things you can detect on an event (only ctrl support right now)
      addTo = (this.CODES[op] = (this.CODES[op] || {}));
    }
    if(!addTo[keyCode] && getSet){
      addTo[keyCode] = [];
    }
    return addTo;
  },
  getCallStack: function(keyCode, op){ //Get the keypress stack for a code and operaion(ie ctrl)
    if(typeof keyCode == 'undefined') return; 
    var addTo = this.CODES;
    if(op && addTo[op]){ //ctrlKey, etc.  Things you can detect on an event (only ctrl support right now)
      addTo = addTo[op];
    }
    return addTo[keyCode];
  },
  addEvt: function(keyCode, func, op/* optional: ie ctrlKey */){ //Add a function to the keypress evts
    var add = this.getSetCallStack(keyCode, op, true);
    if(typeof func == 'function' && add) {
      add[keyCode].push(func);
    } else{
      console.error('Invalid function or keyCode provided (keyCode, func, op)', keyCode, func, op);
    }
  },
  replaceEvts: function(keyCode, func, op){//Replace ALL events for a keycode and optional op+keyCode
    var rep = this.getSetCallStack(keyCode, op, true);
    if(rep && typeof func == 'function'){
      rep[keyCode] = [func];
    }else{
      console.error('Could not replace the events with (keyCode, func, op)', keyCode, func, op);
    }
  },
  removeEvts: function(keyCode, op){//Remove all events for a keycode and optionally op+keyCode
    var rm = this.getCallStack(keyCode, op);
    if(rm){
      rm[keyCode] = null;
    }
  },
  runEvents: function(evt, keyCode, op){//Run all the events associated with a key, op
    var run = this.getCallStack(keyCode, op);
    for (var i in run){
      var func = run[i];
      if(typeof func == 'function'){
        func(keyCode, evt);
      }
    }
    //stop event?
  },
  keyup: function(evt){ 
    try{
      evt = evt || window.event;
      console.log("Keyup Event: ", evt);

      var op = evt.ctrlKey  ? 'ctrlKey'  : null; //Make this smarter
          op = evt.shiftKey ? 'shiftKey' : op;
          op = evt.altKey   ? 'altKey'   : op;
      this.runEvents(evt, evt.keyCode, op);
    }catch(e){
      console.error("Failed to handle a key event (evt, e)", e);
    }
  },
  listen: function(target){ 
    try{
      target = target || window.document;
      if(!this.listener){
        this.listener = this.keyup.bind(this);
        target.addEventListener('keyup', this.listener, false);
      }
    }catch(e){
      console.error("Failed to listen to the key up events.", e);
    }
  },
  sleep: function(target){//Stop paying attention to keypress events on the widget
    try{
      target = target || window.document;
      if(this.listener){
          target.removeEventListener('keyup', this.listener, false);
      }
      this.listener = null;

    }catch(e){
      console.error("Failed to detach to the key up events.", e);
    }
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
  toggleListen: function(){
    this.listener ? this.sleep() : this.listen();
  }
});
