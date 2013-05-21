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

  args.vidUrl  = 'http://localhost:3000/Sample.webm';
  args.vidType = 'video/ogg';
  console.warn("Video URL is being set by default hacky test purposes");

  args.ResourceProject =    Project;
  args.ResourceSubtitles =  Subtitles;
  args.$scope =             $scope;

  var inp = $("#video_url");
  if(inp){
    args.video = inp.value;
  }
  var proj = new DubMark.Project(args);
  $scope.project = proj;  //Don't re-namespace unless you change all the refs in the html

  proj.load();
  console.log("Project correct?, Subtitle correct?", Project, Subtitles);
});
DubMark.Modules.Dub = dub;
