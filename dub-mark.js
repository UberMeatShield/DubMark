
DubMark = {};
DubMark.ProjectStore = {}; //Instances go here for ease of debugging


DubMark.SubManager = function(){ this.init();};
$.extend(DubMark.SubManager.prototype, {
  sub: {
    id: 0
  },
  init: function(){
    this.arr  = [];
    this.curr = null;
  },
  newSub: function(source, sTime, eTime, trans, index){
    sTime = (!isNaN(sTime) && sTime != null ? parseFloat(sTime) : 0.0).toFixed(1);
    eTime = (!isNaN(eTime) && eTime != null ? parseFloat(eTime) : 0.0).toFixed(1);
    if(eTime == 0.0){
      eTime = sTime;
    }

    this.setActive({
      id: (++this.sub.id),
      source: source,
      sTime: sTime,
      eTime: eTime,
      trans: trans
    });

    if(!isNaN(index) && index != null){
      this.arr.splice(index, 0, this.curr);
    }else{
      this.arr.unshift(this.curr);
    }
  },
  setActive: function(sub){
    console.log("What is the sub?", sub);
    if(this.curr) this.curr.active = '';
    this.curr = sub;
    this.curr.active = 'active'; //Markup & selection status
    return this.curr;
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
    console.log("What the shit?", subs, vid);
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
    console.log("Is active?");
    if(sub && this.subs.curr){
      if(sub.id == this.subs.curr.id){
        return 'active';
      }
    }
  },
  newSub: function(){ //Start a sub with the current video time
    var t = this.vid.getTime() || 0;
    console.log("What is the time?", t);
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
    if(sub){
      sub.sTime = this.vid.getTime().toFixed(1);
    }
  },
  setEnd: function(){
    var sub = this.subs.curr;
    if(sub){
      sub.eTime = this.vid.getTime().toFixed(1);
    }
  }
});


DubMark.VideoView = function(id) { this.init(id); };
$.extend(DubMark.VideoView.prototype, {
  init: function(id){ 
    this.id   = id;
    this.fail_listen = 0;
  },
  video: null, //Url for the video
  type: null,  //Type of video for the video tag
  listen: function(vid){ //Supposedly didCreateElement works.. but no such luck for me?
    if(this.fail_listen > 20) return;

    if(!vid && this.id){
       vid = $('#video_' + this.id);
    }

    if(vid && vid.length){
      this.vid = vid;
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
    this.id    = ++this.seq.id;
    this.title = args.title || 'A Title'; //Make this editable

    //For managing the loading of subtitles and addition
    this.subs  = new DubMark.SubManager();
    args.video = args.video || 'video'; //HTML element that contains the video link?  Dumb.  TODO: Fix
    if(args.video){
      this.vid = new DubMark.VideoView(this.id);
      this.vid.listen();
    }

    //Buttons and keypress ahndlers.
    this.controls = new DubMark.Controls(this.subs, this.vid);
    DubMark.ProjectStore[this.id] = this;
  }
});


/**
 *  Loading support for getting paginated lists and loading a new project
 */
DubMark.ProjectList = function(args){
  this.init(args);
};
$.extend(DubMark.ProjectList.prototype, {
  init: function(args){
     this.arr = [];
     this.active = null;
  },
  search: function(){
    console.log("Search");
  },
  create: function(){
    console.log("New Project");
  },
  refresh: function(){
    console.log("Refresh");
  },
  next: function(){
    console.log("Next");
  },
  prev: function(){
    console.log("Previous");
  },
  setActive: function(proj){
    if(proj){
      this.active = proj;
    }
  },
  openId: function(id){
    window.open('/project/' + id);
  },
  openActive: function(){
     if(this.active && this.active.id){
       this.openId(this.active.id); 
     }
  },
  isActive: function(proj){
    if(this.active && this.active.title == proj.title){
      return 'active'; 
    }
  }
});


