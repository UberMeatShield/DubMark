DubMark = Em.Application.create({
  ready: function(){
    console.log("Application is actually ready to start.");
  }
});

DubMark.SubModel = Em.Object.extend({
  start: '',
  end: '',
  text: ''
});
DubMark.ApplicationView = Em.View.extend({
  templateName: 'application'
});
DubMark.ApplicationController = Em.ArrayController.extend({
  content: []
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
  createNew: function(init){
    //Create a fully new page and probably kick off a reload
  },
  loadId: function(id){
    //Ajax call, get project info and load
  },
  getSubCtrl: function(){

  },
  getVideoCtrl: function(){
    if(!this._vidCtrl){
      this._vidCtrl = new DubMark.Video();
    }
    return this._vidCtrl;
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
  },
  play: function(){

  },
  pause: function(){ //Pause the video
    
  },
  getTime: function(){ //Time the video is currently at

  },
  getLength: function(){ //Length of the entire vid

  }
});
