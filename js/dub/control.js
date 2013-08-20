//Note the module name is the same as ng-app="dub"
var dub = angular.module('dub', ['ngResource']);
dub.factory('Project', function($resource){
  var rez = $resource(
      DubMark.Config.getUrl('projects') + '/:id', 
      {format: 'json'}, //Fucking docs...
      { 'get':    {method:'GET'},
        'save':   {method:'POST'},
        'query':  {method:'GET', isArray:true},
        'remove': {method:'DELETE'},
        'delete': {method:'DELETE'} 
      }
  );
  rez.open = function(id){
    window.open('projects/' + id + '/edit/');
  };
  return rez;
});

dub.factory('Subtitles', function($resource){
  var rez = $resource(
      DubMark.Config.getUrl('subs') + '/:id', 
      {format: 'json'}, //Fucking docs...
      { 'get':    {method:'GET'},
        'save':   {method:'POST'},
        'query':  {method:'GET', isArray:true},
        'remove': {method:'DELETE'},
        'delete': {method:'DELETE'} 
      }      
  );
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
  if(!args.id){
    console.error("Complete and total fail, crash the page yo");
  }

  //Initialize with the json from the rails call, single instance vs a lib reference
  args.ResourceProject   = new Project(args);  //$resource single instance to update vs ability to query
  args.ResourceSubtitles = Subtitles;          //$resource subtitle endpoint
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
