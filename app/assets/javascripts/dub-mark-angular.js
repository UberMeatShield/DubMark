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

dub.controller('ProjectListings', function($scope, $resource, Project){
  var list = new DubMark.ProjectList();
  list.$scope = $scope;
  list.loader = Project;
  $scope.list = list;
  list.load();
});

//PageConfig comes from the serialization of the actual json data we already have in the page
dub.controller('ProjectEntry', DubMark.ProjectEntry = function($scope, Project, Subtitles){
  var args = DubMark.Config.PageConfig || {};

  if(!args.id){
    console.error("Complete and total fail, crash the page yo");
  }

  args.vidUrl  = 'http://localhost:3000/Sample.webm';
  args.vidType = 'video/ogg';
  console.warn("Video URL is being set by default hacky test purposes");

  //Initialize with the json from the rails call, single instance vs a lib reference
  args.ResourceProject =    new Project(args); 

  //Subtitles is going to have to build an array of these items so it is the lib
  args.ResourceSubtitles =  Subtitles;
  args.$scope =             $scope;

  var inp = $("#video_url");
  if(inp){
    args.video = inp.value;
  }
  $scope.project = new DubMark.Project(args);
  $scope.proj    = args.ResourceProject;

  $scope.project.load();
  
});
DubMark.Modules.Dub = dub;
