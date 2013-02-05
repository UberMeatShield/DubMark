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
  active: null,
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
DubMark.app = DubMark.ApplicationController.create();


DubMark.VideoView = Em.View.extend({
  templateName: 'vid',
  id: null,
  video: null,
  type: null,
  listen: function(vid){
    if(this.get('isVisible')) {
      if(!vid && this.id){
        vid = $('#' + this.id);
      }
    }
    if(vid && vid.length){
      this._vid = vid;
      vid.bind('timeupdate', this.timeupdate.bind(this));
    } else{
      setTimeout(this.listen.bind(this, null), 200);
    }
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


/**
 *
 */
DubMark.Project = Em.Controller.extend({
  id: null,
  sequence: {id: 0},
  connect: function(init){
    init = init || this._init;

    this.id = ++this.sequence.id;
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
    return this.getSubCtrl().get('active');
  },
  setActiveMark: function(mark){
    this.getSubCtrl().set('active', mark);
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
      var vc = new DubMark.VideoView();
          vc.set('id', 'video_' + this.id);
          vc.set('video', "Sample.webm");
          vc.set('type', "video/ogg");
      this._vidCtrl = vc;
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
  deaf: function(){
    //stop listening for keybinds
  }
});


