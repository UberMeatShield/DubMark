/**
 *  A lot of this came before I understood angular controls and encapsulation.   I could port it
 *  all into the angular app controller, but that actually does seem to make it a little awkward
 *  for debugging / coding in firebug.
 *
 *  Not entirely sure about the Angular class inheritence structure either...
 */
DubMark = window.DubMark || {};
DubMark.timeSec = function(s){ //Coudl include moment js, but seems a little overkill
   if(typeof s != 'string'){
     return 0;
   }
   var cmp = s.match(/(\d{2}):(\d{2}):(\d{2})\.(\d+)/);
   console.log("What is in timeSec?", s, cmp);
   if(!cmp){return 0;}
   return (parseFloat(cmp[1])*3600) + 
     (parseFloat(cmp[2])*60) + 
      parseFloat(cmp[3]) + 
      (parseFloat(cmp[4]) * 1.0 / 1000.0);
};

DubMark.secTime = function(s){ //Seconds to a timestring that works in webVTT or SSA
    s = !isNaN(s) && s != null ? s : (this.vid ? this.vid.getTime() : 0);
    if(isNaN(s) || s == null){
      return '00:00:00.000';
    }
    var sec_num = s;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = (sec_num - (hours * 3600) - (minutes * 60)).toFixed(3);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
};

//Instances go here for ease of debugging and console dev
DubMark.Store = { 
  Project: {},
  ProjectList: {}
}; 

//This is used to provide references to the angular defined bits.
DubMark.Modules = {}; 

//I want to make this scope properly avail from the directives, but they do not play nice?
DubMark.NoSpamming = function(){};
DubMark.NoSpamming.prototype.deferOp = function(cb){
    this.lastTimeChanged = new Date();
    if(this.callIt || typeof cb != 'function'){return;}
    this.callIt = function(cb){
      try{
        var d = new Date();
        if((d - this.lastTimeChanged) > this.deferTime){
          this.callIt = null;
          this.lastTimeChanged = null;
          cb();
        }else{
          setTimeout(this.callIt.bind(this, cb), this.deferTime+50); 
        }
      }catch(e){
        console.error('Error on the save defer.', e);
      }
    }.bind(this, cb);
    this.callIt();
};

/**
 *  Manages loads and writes to the subtitle module
 */
DubMark.SubManager = function(args){ this.init(args);};
$.extend(DubMark.SubManager.prototype, DubMark.NoSpamming.prototype, {
  sub: {
    id: 0
  },
  init: function(args){
    args = args || {};

    this.arr  = [];
    this.curr = null;
    this.deferTime = 1500;

    this.projectId   = args.projectId;
    this.ResourceSub = args.ResourceSubtitles; 
  },
  load: function(args){
    args = args || {projectId: this.projectId};
    if(this.ResourceSub){
      this.arr = this.ResourceSub.query(args);
    }else{
      console.warn("No Resource Sub defined in this SubManager", this);
    }
  },
  changeSub: function(immediate){
    //Defer the save till no modification is done for 2 seconds
    var mod = this.curr;
    if(mod && jQuery.isFunction(mod.$save)){
      if(immediate && mod){
        mod.$save();
      }else{
        this.deferOp(function(mod){
          mod.$save();
        }.bind(this, mod));
      }
    }
  },
  nextSub: function(){
    if(!this.curr){
      this.setActive(this.arr[0], true);
    }else{ 
      for(var i=0; i< this.arr.length; ++i){
        var inst = this.arr[i];
        if(inst.id == this.curr.id){
          if(i+1 < this.arr.length){
            this.setActive(this.arr[i+1], true);
            return;
          }
        }
      }
    }
  },
  prevSub: function(){
    if(!this.curr){
      this.setActive(this.arr[this.arr.length-1], true);
    }else{ 
      for(var i=this.arr.length; i >= 0; --i){
        var inst = this.arr[i];
        if(inst && inst.id == this.curr.id){
          if(i-1 >= 0){
            this.setActive(this.arr[i-1], true);
            return;
          }
        }
      }
    }
  },
  newSub: function(source, sTime, eTime, trans, index){
    sTime = DubMark.secTime(sTime); //provides defaults
    eTime = DubMark.secTime(eTime); 

    this.setActive(
      this.ResourceSub.save({
        projectId: this.projectId,
        source: source,
        sTime: sTime,
        eTime: eTime, 
        trans: trans
      })
    );
    if(!isNaN(index) && index != null){
      this.arr.splice(index, 0, this.curr);
    }else{
      this.arr.unshift(this.curr);
    }
  },
  setActive: function(sub, clickDom){
    if(typeof clickDom == 'boolean' && sub && sub.id){
      var el = angular.element('#sub_' + sub.id);
      console.log("Click this element.", el, sub, clickDom);
      el.trigger('click');
    }
    this.curr = sub;
    return this.curr;
  },
  updateActive: function(){ //Call this on proper edit completion, time updates etc.
    if(this.curr){
      this.curr.save();
    }
  },
  splitSub: function(sub){
    sub = sub || this.curr;
    if(sub && sub.id){
      var sTime = DubMark.timeSec(sub.sTime);
      var eTime = DubMark.timeSec(sub.eTime);
		
      //Freaking javascript string mods...
      var mid = ((parseFloat(eTime) + parseFloat(sTime))/2.0);
      sub.eTime = DubMark.secTime(mid);

      var index = this.getIndex(sub);
      this.newSub(sub.source, mid, eTime, sub.trans, index);
    }
  },
  getIndex: function(sub){
    if(sub && sub.id){
      for(var i=0; i< this.arr.length; ++i){
        if(this.arr[i].id == sub.id){
          return i;
        }
      }
    }
  },
  endSub: function(sub, eTime){
    sub = sub || this.curr;
    if(sub){
      sub.eTime = DubMark.secTime(eTime);
   }
  },
  removeSub: function(id){
    id = typeof id == 'number' ? id  : (this.curr ? this.curr.id : null);
    if(id){
      for(var i=0; i<this.arr.length; ++i){
        if(id == this.arr[i].id){
          var sub = this.arr.splice(i, 1);
          this.curr = this.arr[i] || this.arr[i-1];
          return sub;
        }
      }
    }
  }
});

/**
 *  For handling events
 */
DubMark.Controls = function(subs, vid){this.init(subs, vid);};
$.extend(DubMark.Controls.prototype, {
  init: function(subs, vid){
    this.subs = subs;
    this.vid  = vid;
  },
  setSubs: function(subs){
    this.subs = subs;
  },
  setVid: function(vid){
    this.vid = vid;
  },
  update: function(args){
    console.log('Args?', args, this);
  },
  setCurrent: function(curr){
    this.subs.setActive(curr);
  },
  canEdit: function(){
    return this.subs.curr ? true : false;
  },
  curSub: function(){ //Get the current sub
    return this.subs.curr;
  },
  pauseAndEndSub: function(){
    if(!this.vid){return;}
    var t = this.vid.getTime() || 0;
    this.subs.endSub(null, t);
    this.vid.pause();
  },
  isActive: function(sub){
    if(sub && this.subs.curr){
      if(sub.id == this.subs.curr.id){
        return 'active';
      }
    }
  },
  newSub: function(){ //Start a sub with the current video time
    if(!this.vid){return;}
    var t = this.vid.getTime() || 0;
    this.subs.endSub(null, t); //Close open sub
    this.subs.newSub(null, t); //Create a new sub.
  },
  endSub: function(){ //End the current sub with the current video time
    if(!this.vid){return;}
    var t = this.vid.getTime() || 0;
    this.subs.endSub(null, t); //Close open sub
  },
  removeSub: function(){
    var sub = this.subs.removeSub();
    if(sub && sub.length == 1){
      var s = sub[0];
      s && s.$delete ? s.$delete({id: s.id}) : null;
    }
  },
  jumpStart: function(){
    var sub = this.subs.curr;
    if(sub){
      this.vid.setTime(sub.sTime);
    }
  },
  splitSub: function(){
    this.subs.splitSub();
  },
  jumpEnd: function(){ //jump to the end of a sub
    var sub = this.subs.curr;
    if(sub){
      this.vid.setTime(sub.eTime);
    }
  },
  parsedTime: function(){ //parse the time
    return DubMark.secTime(this.vid.getTime());
  },
  setStart: function(){
    var sub = this.subs.curr;
    if(sub){//Hmm.. this doesn't trigger the on change event?
      sub.sTime = this.parsedTime();
      this.subs.changeSub();
    }
  },
  setEnd: function(){
    var sub = this.subs.curr;
    if(sub){ //A set end doesn't change the set end but does update the UI correctly, odd
      sub.eTime = this.parsedTime();
      this.subs.changeSub(true);
    }
  }
});


DubMark.VideoView = function(id) { this.init(id); };
$.extend(DubMark.VideoView.prototype, {
  init: function(id){ 
    this.id   = id;
    this.fail_listen = 0;

    this.vid    = null; //Placeholder for the actual dom.
    this.loaded = false;
    this.vidUrl = null;
    this.testVidChange = null; //For modification tests pre-save
  } ,
  reset: function(){
    $('#video').empty();
    this.createVideo(this.vidUrl, this.vidType);
  },
  createVideo: function(vidUrl, vidType){
    this.loaded = false;
    if(vidUrl && this.videoDom){
      this.vidUrl = vidUrl;
      try{ //Video tags do not play nice with post process operations.
        var v  = $('#' + this.videoDom)
        if(!v) {
          console.log("Forced to create it.... sad times.");
          v = $('body').append($('<div>', {id: this.videoDom}));
        }
        var vidId = 'video_' + this.id;
        var vid = $('<video>', {class: 'span12', id: vidId, controls: true}).append(
          $('<source>',  {
            type: vidType || 'video/ogg',  //Guess source type
            src: vidUrl
          }),
          $('<track>', {
            kind: 'subtitles',
            label: 'Web VTT test',
            src: '../../' + this.id + '/format',
            srclng: 'en' //Lang controls for translation target required.
          })
        );
        v.append(vid);
        this.listen($('#' + vidId));
      }catch(e){
        console.error('Failed to create the video element', e);
      }
      return true;
    }
    return false;
  },
  setDomContainer: function(domId){
    this.videoDom = domId;
  },
  listen: function(vid){ //Supposedly didCreateElement works.. but no such luck for me?
    if(this.fail_listen > 20) return;
    if(!vid && this.id){
       vid = $('#video_' + this.id);
    }
    if(vid && vid.length){
      this.vid = vid;
      this.loaded = this.vid[0].canPlay ? true : false ;
      vid.bind('timeupdate', this.timeupdate.bind(this));
    } else{
      setTimeout(this.listen.bind(this, null), 200);
    }
    this.fail_listen++;
  },
  timeupdate: function(t){
    console.log("What is the current time?", t);
    //Set the currently active subsource
  },
  load: function(){
    if(!this.LOAD_CALLED){
      this.LOAD_CALLED = true;
      this.vid.get(0).load();
    }
  },
  toggleVideo: function(){
    if(!this.vid){return 0};
    var vidDom = this.vid.get(0);
    if(vidDom.paused){
      this.play();
    }else{
      this.pause();
    }
  },
  play: function(){
    if(!this.vid){return 0};
    this.vid.get(0).play();
  },
  pause: function(){ //Pause the video
    if(!this.vid){return 0};
    this.vid.get(0).pause();
    return this.getTime();
  },
  setTime: function(t){
    if(!isNaN(t)){
      this.vid.get(0).currentTime = t;
    }
  },
  getTime: function(){ //Time the video is currently at
    if(!this.vid){return 0};
    var t = this.vid.get(0).currentTime;
    return t;
  },
  getDuration: function(){ //Length of the entire vid
    return this.vid.duration;
  }
});


DubMark.Actions = function(project, itl){
  this.project = project;
};
$.extend(DubMark.Actions.prototype, {
  init: function(){
  },
  setProject: function(proj){
    this.project = proj;
  },
  newSub: function(){
    this.project.controls.newSub();
  },
  endSub: function(){
    this.project.controls.endSub()
  },
  pauseAndEndSub: function(){
    this.project.controls.pauseAndEndSub()
  },
  splitSub: function(){
    this.project.controls.splitSub()
  },
  removeSub: function(){
    this.project.controls.removeSub()
  },
  setStart: function(){
    this.project.controls.setStart()
  },
  setEnd: function(){
    this.project.controls.setEnd()
  },
  jumpStart: function(){
    this.project.controls.jumpStart()
  },
  jumpEnd: function(){
    this.project.controls.jumpEnd()
  },
  changeSub: function(){
    this.project.subs.changeSub();
  },
  toggleVideo: function(){
    //test?
    this.project.vid.toggleVideo(); //play vs pause
  },
  playVideo: function(){
    this.project.vid.play()
  },
  pauseVideo: function(){ 
    this.project.vid.pause()
  },
  focusSource: function(){
    angular.element('#source').trigger('focus');                  
    this.keypressOff();
  },
  focusTranslation: function(){
    angular.element('#translation').trigger('focus');                  
    this.keypressOff();
  },
  keypressOff: function(){
    var el = angular.element('#hotkeys');
    if(el.hasClass('active')){
      this.keypressToggle();
    }
  },
  keypressToggle: function(){
    var el = angular.element('#hotkeys');
        el.trigger('click');
    if(el.hasClass('active')){
      document.activeElement.blur();
    }
  },
  nextSub: function(){
    this.project.subs.nextSub();
  },
  prevSub: function(){
    this.project.subs.prevSub();
  }
});


/**
 *  The main project entry point.
 */
DubMark.Project = function(args){this.init(args);};
$.extend(DubMark.Project.prototype, DubMark.NoSpamming.prototype, {
  seq: {
    id: 0
  },
  init: function(args){
    args = args || {};
    this.id    = args.id    || ++this.seq.id;

    this.deferTime = 1500;
    //Resource loaders from Angular module and the angular scope
    this.ResourceProject   = args.ResourceProject;
    this.$scope            = args.$scope;

    //For managing the loading of subtitles and addition
    this.subs  = new DubMark.SubManager({
      projectId: this.id,
      ResourceSubtitles: args.ResourceSubtitles,
    });

    //HTML element that contains the video link?  Dumb.  TODO: Fix
    this.vid = new DubMark.VideoView(this.id);
    this.vid.setDomContainer(args.vidDomId || 'video');
    this.vid.createVideo(args.vidUrl, args.vidType);

    //Buttons and keypress ahndlers.
    this.controls = new DubMark.Controls(this.subs, this.vid);

    //Instance reference for ease of firebug
    DubMark.Store.Project[this.id] = this;
  },
  getActiveSub: function(){
    if(this.subs){
      return this.subs.curr;
    }
    return null;
  },
  /**
   * Uses instance variables
   */
  load: function(){
    if(this.ResourceProject){
      this.ResourceProject.$get({id: this.id}, this.loadCb.bind(this));
      this.subs.load();
    }
  },
  update: function(){
    console.log("Does update?");
    this.deferOp(function(){
      this.ResourceProject.$save();
    }.bind(this));
  },
  loadCb: function(response){ //Error handling?
    console.log("Project Load Callback (not really needed)", response);
  }
});


/**
 *  Help with loading up styles, creating new ones etc.
 */
DubMark.StylinManager = function(args){this.init(args);};
$.extend(DubMark.StylinManager.prototype, DubMark.NoSpamming.prototype, {
  init: function(args){
    args = args || {};
    console.log("New Style manager., need to make the load smarter");
    this.ResourceStylin = args.ResourceStylin;
    this.all        = [];
    this.projStylin = [];
    this.current    = null;
  },
  load: function(id){ //Bleah, this is going to suck (get stylins for resource)
    this.projStylin = this.ResourceStylin.query({
      id: id
    });
  },
  loadAll: function(){ //Do I even need to care about loading all
    this.all = this.ResourceStylin.query();
  },
  setActiveStyle: function(style){
    this.current = style;
    console.log("Set the active style.");
  },
  getActiveStyle: function(){
    return this.current;
  },
  getStylin: function(id){ //A resource object.
    var search = this.all.length ? this.all : this.projStylin;
    var entry = null;
    for (var i=0; i<search.lenth; ++i){
      entry = search[i];
      if(entry && entry.id == id){
        return entry;
      }
    }
    return null;
  },
  newStylin: function(){ //Create a new one
    var s = new (this.ResourceStylin);
    s.title = 'new item';
    this.populateDefaults(s);
    s.$save();

    this.all.unshift(s);
    return s;
  },
  populateDefaults: function(){ //Hmmmm

  }
});
