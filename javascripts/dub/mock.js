//Note the module name is the same as ng-app="dub"
var dub = angular.module('dub', ['ngResource']);

DubMark.MockResource = function(){ //No resource mock?
  this.init();
};
$.extend(DubMark.MockResource.prototype, {
  sequence: {id: 0},
  $get: function(func){
    typeof func == 'function' ? func() : null;
    return this;
  },
  init: function(){
    this.id = this.sequence.id++; 
    this.status = this.getStates();
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
  $save: function(args, func){
    typeof func == 'function' ? func(args) : null;
    console.log("$save", args, this);
    $.each(args || {}, function(key, val){
      this[key] = val;
    });
    this.id = this.sequence.id++; 
  
    return this;
  },
  $query: function(func){
    return [{}];
  },
  $remove: function(func){
    delete this;
  },
  get: function(args){
    return {};
  },
  query: function() { return [{title: 'Mock', id: 'mock'}] },
  save: function(args, cb) {
    console.log("save: ", args, cb);
    this.id = this.sequence.id++; 
    args.id = this.id;
    if(typeof cb == 'function'){
      args.title = args.title + ' MOCK';
      cb(args);
    }
    console.log(this, args);
    return args;
  },
  open: function(id){
    window.open('edit.html?id=' + id);
  },
  remove: function(args, func){
    typeof func == 'function' ? func(args) : null;
    delete this;
  },
  set: function(key, val){
    return this[key] = val;
  },
  get: function(){
    return this[key];
  },
});



DubMark.MockProjectResource = function(){
  this.init();
};
$.extend(DubMark.MockProjectResource.prototype, DubMark.MockResource.prototype);

dub.factory('Project', function(){
  var project = DubMark.MockProjectResource;
  return project;
});

DubMark.MockSubsResource = function(){
  this.init();
};
$.extend(DubMark.MockSubsResource.prototype, DubMark.MockResource.prototype);
dub.factory('Subtitles', function(){
  var rez = DubMark.MockSubsResource;
  console.log("Subs?", rez, new rez());
  return rez;
});

//For the index.html page
dub.controller('ProjectListings', function($scope, $resource, Project){
  var args = DubMark.Config.PageConfig || {};

  if(args.data){
    var arr = [];
    var data = args.data;
    for(var i=0; i< data.length; ++i){
      arr.push(new Project(data[i]));
    }
    args.data = arr;
  }

  var list = new DubMark.ProjectList(args);
      list.ResourceProject = Project; //For creating new instances
      list.$scope = $scope;

  $scope.list = list;
  //list.load();
});

//This is used on the edit page
//PageConfig comes from the serialization of the actual json data we already have in the page
dub.controller('ProjectEntry', DubMark.ProjectEntry = function($scope, Project, Subtitles){
  var args = DubMark.Config.PageConfig || {};

  //Initialize with the json from the rails call, single instance vs a lib reference
  args.id = 1;
  args.ResourceProject   = new Project(args);  //$resource single instance to update vs ability to query
  args.ResourceSubtitles = new Subtitles();          //$resource subtitle endpoint
  args.$scope =            $scope; //Newb learning

  //Point various bits of scope at each other
  $scope.project  = new DubMark.Project(args);
  $scope.action   = new DubMark.Actions($scope.project);
  $scope.keypress = new DubMark.KeyPress($scope.action);


  $scope.Lang     = DubMark.i18n.getInstance(); //TODO, needs to set stuff... Bleah
  $scope.i18n     = DubMark.i18n.Lang; //Shorthand for in the app using angular bindings

  $scope.proj     = args.ResourceProject;
  $scope.project.load();

});

DubMark.Modules.Dub = dub;
