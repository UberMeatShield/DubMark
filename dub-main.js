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
  }
});
DubMark.Router = Em.Router.extend({
  root: Em.Route.extend({
    index: Em.Route.extend({
      route: '/'
    })
  })
});
DubMark.app = DubMark.ApplicationController.create();

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
    //Create a new mark
    console.log("Create a new mark");
  },
  endMark: function(){
    //Get the active mark, get the time and update the end time
    console.log("Get the active mark, get the time and update the end time");
  },
  pauseMark: function(){
    //End the mark, ALSO pause the video
    console.log("End the mark, ALSO pause the video");
  },
  editMark: function(){
    //This may actually suck the hardest.
    console.log("This may actually suck the hardest.");
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
    this._vid.play(); 
    return this.getTime();
  },
  pause: function(){ //Pause the video
    this._vid.pause(); 
    return this.getTime();
  },
  getTime: function(){ //Time the video is currently at
    return this._vid.currentTime;
  },
  getDuration: function(){ //Length of the entire vid
    return this._vid.duration;
  }
});
