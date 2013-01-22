DubMark = Em.Application.create({
  ready: function(){
    console.log("Application is actually ready to start.");
  }
});

DubMark.SubModel = Em.Object.extend({
  id: '',
  start: '',
  end: '',
  text: '',
  source: '',
  notes: ''
});
DubMark.ApplicationView = Em.View.extend({
  templateName: 'application'
});
DubMark.ApplicationController = Em.ArrayController.extend({
  content: [],
  id: '1', 
  markId: {
    val: 0
  },
  newSub: function(start, end, text, notes){
    var mark = DubMark.SubModel.create({start: start, end: end, text: text, notes: notes});
    //Going to have to hit the DB for this crap.
    this.pushObject(mark);
    return mark;
  }
});
DubMark.Router = Em.Router.extend({
  root: Em.Route.extend({
    index: Em.Route.extend({
      route: '/'
    })
  })
});

/**
 *
 */
DubMark.Project = function(init){
  this._init = init;
};
$.extend(DubMark.Project.prototype, {
  connect: function(init){
    var vid = $('#' + this._init.id);
    if(vid){
      var vc = this.getVideoCtrl();
          vc.listen(vid);
    }else{
      console.error("Failed to find a video with this init data.", this._init);
    }
  },
  newMark: function(){
    var current = this.getActiveMark();
    if(current){
      this.endMark(current);
    }
    var mark = this.getSubCtrl().newSub(
      this.getVideoCtrl().getTime(),
      null,
      'new',
      ''
    );
    this.setActiveMark(mark);
    //Create a new mark
    console.log("Create a new mark");
  },
  endMark: function(mark){
    mark = mark || this.getActiveMark();
    if(mark && mark.set){
      console.log("Get the active mark, get the time and update the end time", mark);
      mark.set('end', this.getVideoCtrl().getTime());
    }
  },
  pauseMark: function(){
    this.getVideoCtrl().pause();
    this.endMark();
    //End the mark, ALSO pause the video
    console.log("End the mark, ALSO pause the video");
  },
  editMark: function(mark){
    mark = mark || this.getActiveMark();

    //This may actually suck the hardest.
    console.log("This may actually suck the hardest.", mark);
  },
  getActiveMark: function(){
    //return the currently active mark if it exists.
    return this.mark;
  },
  setActiveMark: function(mark){
    this.mark = mark;
  },
  escMark: function(){
    //Done with the mark, set the mark to null
    console.log("Done with the mark, set the mark to null");
  },
  getSubCtrl: function(){
    if(!this._subCtrl){
      if(!DubMark.app){
        DubMark.app = DubMark.ApplicationController.create();
      }
      this._subCtrl = DubMark.app; //HMMMMM
    }
    return this._subCtrl;
  },
  getVideoCtrl: function(){
    if(!this._vidCtrl){
      this._vidCtrl = new DubMark.Video();
    }
    return this._vidCtrl;
  }
});


/**
 *  Listen for a set of configurable bindings
 */
DubMark.ProjectKeys = function(project, bindings){
  this.setProject(project);
  this.bindings = bindings || this.BindDefaults;
};
$.extend(DubMark.ProjectKeys.prototype, {
  BindDefaults: {

  },
  setProject: function(project){
    this.project = project;
  },
  getProject: function(){
    return this.project;
  },
  listen: function(){
    //listen for keybinds
  },
  deaf: function(){
    //stop listening for keybinds
  }
});


/**
 * For the control of various video timing issues.
 */
DubMark.Video = function(){

};
$.extend(DubMark.Video.prototype,{
  listen: function(vid){
    this._vid = vid;
    //Connect the event based pipes.
    vid.bind('timeupdate', this.timeupdate.bind(this));
  },
  timeupdate: function(t){
    console.log("What is the current time?", t);
    //Set the currently active subtitle
  },
  play: function(){
    this._vid.get(0).play(); 
    return this.getTime();
  },
  pause: function(){ //Pause the video
    this._vid.get(0).pause(); 
    return this.getTime();
  },
  getTime: function(){ //Time the video is currently at
    var t = this._vid.get(0).currentTime; 
    return t;
  },
  getDuration: function(){ //Length of the entire vid
    return this._vid.duration;
  }
});
