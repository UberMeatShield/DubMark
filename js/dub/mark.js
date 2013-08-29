//Make this provide the ngResource as args to a controller, lets us define and create certain resource

//Angular seriously handles some strange ass magic.
DubMark = {};
DubMark.Store = { //Instances go here for ease of debugging and console dev
  Project: {},
  ProjectList: {}
}; 
DubMark.Modules = {};

//I want to make this scope properly avail from the directives, but they do not play nice?
DubMark.States = DubMark.States || {
  New: 'icon-plus',
  VideoReady: 'icon-facetime-video',
  Timed: 'icon-time',
  Translated: 'icon-comment',
  QA: 'icon-thumbs-up',
  Completed: 'icon-ok',
  Published: 'icon-share'
};
DubMark.StatesOrder = ["VideoReady", "Timed", "Translated", "QA", "Published"];

//Tweak these config settings before creating an instance so that we know where
//to make ajax calls.
DubMark.Config = {
  DEBUG: true, //For eventual console log debugging.
  base: {
    url: '' //Assume same server url
  },
  projects:{ //The listings of the projects
    url: 'projects'
  },
  subs: { //Ja subtitles, jaaa
    url: 'subs'
  },
  videos: { //Get video location & hopefully proper headers?
    url: 'vid'
  },
  getUrl: function(name){
    var C = DubMark.Config;
    var url = C[name] ? C[name].url : name;
    if(url){
      if(url.match('http')){
         console.log("URL", url);
         return url;
      }else if(C.base.url){ //Use reletive paths unless we are told otherwise
        console.log("URL", C.base.url + url);
        return C.base.url + url;
      }else{
        console.warn('No DubMark.Base.url set was set, guessing that (', name, ') is simply the correct path.');
        return name; 
      }
    }
    throw 'Cannot find config for ' + name;
  }
};


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
    sTime = (!isNaN(sTime) && sTime != null ? parseFloat(sTime) : 0.0).toFixed(1);
    eTime = (!isNaN(eTime) && eTime != null ? parseFloat(eTime) : 0.0).toFixed(1);
    if(eTime == 0.0){
      eTime = sTime;
    }

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
    console.log("Click set active.", sub);
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
      var sTime = sub.sTime;
      var eTime = sub.eTime;
      sTime = (!isNaN(sTime) && sTime != null ? parseFloat(sTime) : 0.0).toFixed(1);
      eTime = (!isNaN(eTime) && eTime != null ? parseFloat(eTime) : 0.0).toFixed(1);
      
      //Freaking javascript string mods...
      var mid = ((parseFloat(eTime) + parseFloat(sTime))/2.0);
          mid   = (!isNaN(mid) && mid != null ? parseFloat(mid) : 0.0).toFixed(1);
      sub.eTime = mid;
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
    console.log("END THE SUB", sub, eTime);
    sub = sub || this.curr;
    if(sub){
      sub.eTime = (!isNaN(eTime) && eTime != null ? parseFloat(eTime) : 0.0).toFixed(1);
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
  jumpEnd: function(){
    var sub = this.subs.curr;
    if(sub){
      this.vid.setTime(sub.eTime);
    }
  },
  secTime: function(s){
    var sec_num = s;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = (sec_num - (hours * 3600) - (minutes * 60)).toFixed(2);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
  },
  setStart: function(immediate){
    var sub = this.subs.curr;
    if(sub){//Hmm.. this doesn't trigger the on change event?
      
      
      sub.sTime = this.secTime(this.vid.getTime());
      this.subs.changeSub(true);
    }
  },
  setEnd: function(){
    var sub = this.subs.curr;
    if(sub){ //A set end doesn't change the set end but does update the UI correctly, odd
      sub.eTime = this.secTime(this.vid.getTime());
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
  loadCb: function(response){
    console.log("Project Load Callback.", response);
  }
});
