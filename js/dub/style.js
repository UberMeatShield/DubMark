/**
 * Provides a state handler that can be used on a project item to update the status information.
 *
 * It requires a .proj to be available in the scope, so either ng-init="proj = $Resource" or something
 * similar
 * 
 *  Note: These get pretty complex pretty fast... might want to put them in a not so "Shared" location since
 * they are still going to require access to the control modules?
 */
DubMark.Modules.Dub.directive('projstylin', function(){
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element){

      //Load this into the project and prep to update
      var dialog = null;
      $scope.globalStyles = [{
          t: 'Default', 
          id: 1,
        },{
          t: 'Monkey',
          id: 1
        }
      ];

      $scope.isActive = function(cfg){
        var sub = $scope.project.getActiveSub();
        if(sub){
          if(sub.styleName && sub.styleName == cfg.t){
            return 'active';
          }else if(!sub.styleName && (cfg.t == $scope.gT('Default'))){
            return 'active';
          }
        }
      };
      $scope.openStyleManager = function(){
        dialog = $('#stylin_project');
        dialog.modal('show');
      };

      $scope.close = function(){
        dialog ? dialog.modal('hide') : null;
      };

      $scope.applyStyle = function(el){ //Apply the style to the currently active sub.
        console.log("Apply this style to el.", el);
        var sub = $scope.project.getActiveSub();
        if(sub){
          sub.styleName = el.t;
          sub.$save();
        }
      }
    },
    template: 
      '<div id="globalstyles" class="well container-fluid">' +
        '<div id="stylin_project" tabindex="-1" class="modal hide" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
          '<div class="modal-header">'+
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
            '<h3>{{gT("Add Styles to project")}}</h3>'+
          '</div>'+
          '<div class="modal-body">'+
            'Add styles to project' +
          '</div>'+
          '<div class="modal-footer">'+
            '<a ng-click="save()" href="#" class="btn btn-primary">Save</a>'+
            '<a ng-click="close()" href="#" class="btn">Close</a>'+
          '</div>'+
        '</div>'+

        '<button class="btn pull-right" ng-click=openStyleManager()>' +
          '{{gT("Open M")}}' +
        '</button>' +
        '<ul class="nav nav-list">' +
        '<li class="nav-header"> {{gT("Apply Style")}} </li>' +
        '<li class={{isActive(s)}} ng-repeat="s in globalStyles"> ' +
          '<a ng-click=applyStyle(s)>' +
          '{{gT(s.t)}}' +
          '</a>' +
        '</li>' +
        '</ul>' +
      '</div>'
  };
});



DubMark.Modules.Dub.directive("stylin", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      $scope.settings = JSON.parse(JSON.stringify(DubMark.Config.Style));

      var dialog = null;
      $scope.save = function(){
        console.log("Save a new element scope.");
      };
      $scope.show = function(){
        console.log("Show the dialog.");
        dialog = $('#stylin_change').modal('show');
      };
      $scope.close = function(){
        console.log("close", this, dialog);
        dialog.modal('hide');
      }
    },
    template:   //Copy Pasta
     '<div>' +
      '<div id="stylin_change" tabindex="-1" class="modal hide" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-header">'+
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
          '<h3>{{gT("Change Sub Style")}}</h3>'+
        '</div>'+
        '<div class="modal-body">'+
          '<div class="row-fluid" ng-repeat="cfg in settings">' +
            '<!-- Iterate over the available settings -->' +
            '<span class="span4"> {{gT(cfg.t)}} </span>' +
            '<input class="span5" type="text"' +
              ' ng-change=change()' + 
              ' ng-model=cfg.d />' +
          '</div>' + 
        '</div>'+
        '<div class="modal-footer">'+
          '<a ng-click="save()" href="#" class="btn btn-primary">Save</a>'+
          '<a ng-click="close()" href="#" class="btn">Close</a>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">' +
        '<button class="btn" ng-click=show()>' + 
          '{{gT("Style")}}' +
      '</div>' +
    '</div>',
    replace: true
  };
});

