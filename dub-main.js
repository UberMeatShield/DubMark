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
DubMark.ApplicationController = Em.Controller.extend({
  id: '1', 
  markId: {
    val: 0
  }
});

DubMark.MarkView = Em.View.extend({
  templateName: 'subtitle'
});

DubMark.SubView = Em.View.extend({
  click: function(evt){
    console.log("Feel the hate.", evt);
  }
});


//This is fucking special.
DubMark.ActiveView = Em.View.extend({
  templateName: 'active'
});
DubMark.ActiveMarkController = Em.Controller.extend({
  templateName: 'active',
  active: null
});


DubMark.MarkController  = Em.ArrayController.extend({
  content: [],
  templateName: 'subtitle',
  click: function(evt){
    console.log("I can has click");
  },
  newSub: function(start, end, text, notes){
    var mark = DubMark.SubModel.create({start: start, end: end, text: text, notes: notes});
    //Going to have to hit the DB for this crap.
    this.pushObject(mark);
    return mark;
  }
});


DubMark.VideoView = Em.View.extend({
  id: null,
  video: null, //Url for the video
  type: null,  //Type of video for the video tag
  templateName: 'vid',
  listen: function(vid){ //Supposedly didCreateElement works.. but no such luck for me?
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
    return this.getActiveCtrl().get('active');
  },
  setActiveMark: function(mark){
    this.getActiveCtrl().set('active', mark);
  },
  escMark: function(){ //Done with the mark, set the mark to null
    console.log("Done with the mark, set the mark to null");
  },
  getActiveCtrl: function(){
    if(!this._actCtrl){
      this._actCtrl = DubMark.activeMark || DubMark.ActiveMarkController.create();
    }
    return this._actCtrl;
  },
  getSubCtrl: function(){
    if(!this._subCtrl){
      this._subCtrl = DubMark.mark || DubMark.MarkController.create();
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


