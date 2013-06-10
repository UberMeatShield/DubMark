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
        return url;
      }else if(C.base.url){ //Use reletive paths unless we are told otherwise
        return C.base.url + url;
      }else{
        console.warn('No DubMark.Base.url set was set, guessing that (', name, ') is simply the correct path.');
        return name; 
      }
    }
    throw 'Cannot find config for ' + name;
  }
};

/**
 *  Manages loads and writes to the subtitle module
 */
DubMark.SubManager = function(args){ this.init(args);};
$.extend(DubMark.SubManager.prototype, {
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
    console.log("Args for the load?", args);
    args = args || {projectId: this.projectId};
    if(this.ResourceSub){
      this.arr = this.ResourceSub.query(args);
    }else{
      console.warn("No Resource Sub defined in this SubManager", this);
    }
  },
  changeSub: function(){
    //Defer the save till no modification is done for 2 seconds
    if(this.curr && jQuery.isFunction(this.curr.$save)){
      this.lastTimeChanged = new Date();
      this.deferSave(this.curr);
    }
  },
  deferSave: function(obj){ //Note obj is what is bound, NOT this.curr
    if(this.saveIt && obj) return;
    this.saveIt = function(obj){
      try{
        var d = new Date();
        if((d - this.lastTimeChanged) > this.deferTime){
          this.saveIt = null;
          obj.$save();
        }else{
          setTimeout(this.saveIt.bind(this, obj), this.deferTime+50); 
        }
      }catch(e){
        console.error('Error on the save defer.', e);
      }
    }.bind(this, obj);
    this.saveIt();
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
  setActive: function(sub){
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
          this.curr = null;
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
    var t = this.vid.getTime() || 0;
    this.subs.endSub(null, t); //Close open sub
    this.subs.newSub(null, t); //Create a new sub.
  },
  endSub: function(){ //End the current sub with the current video time
    var t = this.vid.getTime() || 0;
    this.subs.endSub(null, t); //Close open sub
  },
  removeSub: function(){
    this.subs.removeSub();
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
  setStart: function(){
    var sub = this.subs.curr;
    if(sub){//Hmm.. this doesn't trigger the on change event?
      sub.sTime = this.vid.getTime().toFixed(1);
      this.subs.changeSub(); 
    }
  },
  setEnd: function(){
    var sub = this.subs.curr;
    if(sub){ //A set end doesn't change the set end but does update the UI correctly, odd
      sub.eTime = this.vid.getTime().toFixed(1);
      this.subs.changeSub(); 
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
  play: function(){
    this.vid.get(0).play();
    //return this.getTime();
  },
  pause: function(){ //Pause the video
    this.vid.get(0).pause();
    return this.getTime();
  },
  setTime: function(t){
    if(!isNaN(t)){
      this.vid.get(0).currentTime = t;
    }
  },
  getTime: function(){ //Time the video is currently at
    var t = this.vid.get(0).currentTime;
    return t;
  },
  getDuration: function(){ //Length of the entire vid
    return this.vid.duration;
  }
});




/**
 *  The main project entry point.
 */
DubMark.Project = function(args){this.init(args);};
$.extend(DubMark.Project.prototype, {
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
      console.log("Attempt to save.");
      this.ResourceProject.$save();
    }.bind(this));
  },
  deferOp: function(cb){
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
  },
  loadCb: function(response){
    console.log("Project Load Callback.", response);
  }
});



/**
 *  Todo: check out the angular mock classes instead of custom hack sauce
 */
DubMark.MockProjectResource = function(){
  this.id = 0;
};
$.extend(DubMark.MockProjectResource.prototype, {
  query: function() { return [{title: 'Mock', id: 'mock'}] },
  save: function(args, cb) { 
    console.log("Save", args, cb);
    if(typeof cb == 'function'){ 
      args.id = ++this.id;
      args.title = args.title + ' MOCK';
      cb(args);
    }
    return args;
  },
  open: function(id){
    window.open('edit.html?id=' + id);
  }
});
/**
 *  Loading support for getting paginated lists and loading a new project
 */
DubMark.ProjectList = function(args){
  this.init(args);
};

$.extend(DubMark.ProjectList.prototype, {
  sequence: {id: 0},
  init: function(args){
     this.arr = args && args.data ? args.data : [];
     this.active = null;
     this.deferTime   = 500;

     //Search oriented items.
     this.filterTitle = ''
     this.page        = 0;
     this.state       = '';
  
     DubMark.Store.ProjectList[this.sequence.id++] = this;
  },
  load: function(){
    //Ajax call to the server, attempt to load the list of projects we have avail
    this.ResourceProject = this.ResourceProject || new DubMark.MockProjectResource();
    this.arr = this.ResourceProject.query(function(wtf){
      console.log("Project list loaded successfully.");
    });
  },
  filterChange: function(){
    this.page = 0; //Reset the page we are on (pagination)
    this.search();
  },
  next: function(){
    this.page++;
    console.log("The page we are on.", this.page);
    this.search();
  },
  prev: function(){
    this.page--;
    console.log("The page we are on.", this.page);
    this.search();
  },
  search: function(){
    try{
      var cb = function(){
        if(this.filterTitle != ''){
          this.arr = this.ResourceProject.query({
            title: this.filterTitle,
            state: this.state,
            page:  this.page
          })
        }else{
          this.load();
        }
      }.bind(this);
      this.deferOp(cb);
    }catch(e){
      console.error("Failed to filter hange.", e)
    }
  },
  deferOp: function(cb){
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
  },
  isComplete: function(key){
    if(this.active && this.active.status && this.active.status[key]){
      return 'completed';
    }
    return '';
  },
  getStateIcon: function(key){
    var icon =  DubMark.States[key];
    if(key && this.active){
      if(this.active.status[key]){
        return icon;
      }
    }
    return icon;
  },
  getStates: function(){
    var newStates = {};
    for (key in DubMark.States){
      if(typeof key == 'string'){
        newStates[key] = null;
      }
    }
    newStates.New = new Date();
    return newStates;
  },
  validateCreate: function(response){
    if(!response || !response.id){
      console.error("Failed to create.", response);
      return;
    }
    this.arr.unshift(response); //Might not need to do this?
    this.setActive(response);
  },
  refresh: function(){
    this.load();
  },
  setActive: function(proj){
    console.log("Set Active", proj);
    if(proj){
      this.active = proj;
    }
  },
  disableCreate: function(){
    this.disabledCreateButton = true;
  },
  enableCreate: function(){
    setTimeout(function(){
      this.disabledCreateButton = false;
    }.bind(this), 500);
  },
  openActive: function(){
     if(this.active && this.active.id){
       this.ResourceProject.open(this.active.id);
     }
  },
  isActive: function(proj){
    if(this.active && this.active.id == proj.id){
      return 'info'; 
    }
  }
});


