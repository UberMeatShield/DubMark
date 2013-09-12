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
    scope: {
      project: '=',
      stylin: '='
    },
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
      $scope.gT = DubMark.i18n.gT;

      this.project = $scope.project;
      this.stylin  = $scope.stylin;
      this.gT      = $scope.gT;


      //Build a valid list of the selectable styles (provide a new button).
      //
      //On click select the style manager style, apply it to the scope of the sub wiget
      //
      //Use that sub widget to edit?  Or just do something simple?

      $scope.isActive = function(cfg){
        var sub = this.project.getActiveSub();
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

      $scope.getResource = function(){
          return this.stylin.getActiveStyle();
      };

      $scope.close = function(){
        dialog && dialog.modal('hide');
      };

      $scope.applyStyle = function(el){ //Apply the style to the currently active sub.
        var sub = $scope.project.getActiveSub();
        if(sub){
          sub.styleName = el.t;
          sub.$save();
        }
      }
    },
    template: 
      '<div id="globalstyles" class="well container-fluid">' +
    
        //Section for pulling up the list of all available styles
        '<div id="stylin_project" tabindex="-1" class="modal hide" role="dialog" aria-hidden="true">' +
          '<div class="modal-header">'+
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
            '<h3>{{gT("Add Styles to project")}}</h3>'+
          '</div>'+
          '<div class="modal-body">'+
            'List each style that can be selected for the project.' +
            'Add styles to project' +
            '{{gT("Get text test")}}' +
            'Build a custom UI to handle configuration and adds to proj' +
          '</div>'+
          '<div class="modal-footer">'+
            '<a ng-click="close()" href="#" class="btn">Close</a>'+
          '</div>'+
        '</div>'+

        //Element for customizing style information (or just make it a side by side layout?")
        '<div id="stylin_new" tabindex="-1" class="modal hide" role="dialog" aria-hidden="true">' +
          '<div class="modal-header">'+
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
            '<h3>{{gT("Add Styles to project")}}</h3>'+
          '</div>'+
          '<div class="modal-body">'+
            'Create a new style / edit it.' +
          '</div>'+
          '<div class="modal-footer">'+
            '<a ng-click="save()" href="#" class="btn btn-primary">Save</a>'+
            '<a ng-click="close()" href="#" class="btn">Close</a>'+
          '</div>'+
        '</div>'+

        //Basic selection of styles.
        '<ul class="nav nav-list">' +
        '<li class="nav-header"> ' +
          '<span>{{gT("Apply Style")}}</span>' +  
          '<button class=" pull-right"' + 
            ' ng-click=openStyleManager()' +
            ' >' +
            '<i class="icon-cog"></i>' +
          '</button>' +
        '</li>' +
        '<li class={{isActive(s)}} ng-repeat="s in globalStyles"> ' +
          '<a  ng-click=applyStyle(s)>' +
          '{{gT(s.t)}}' +
          '</a>' +
        '</li>' +
        '</ul>' +
      '</div>'
  };
});


//I am missing some key bit of the scoping / encapsulation when using this code
//base.
DubMark.Modules.Dub.directive("substylin", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: {
      resource: '='
    },
    controller: function($scope, $element) {
      //The settings setill need to have an order to iterate through.
      $scope.settings = JSON.parse(JSON.stringify(DubMark.Config.Style));

      console.log("What came into the scope?", $scope, DubMark);

      this.resource = $scope.resource;
      $scope.gT     = DubMark.i18n.gT;

      var dialog = null;
      $scope.save = function(){
        var rez = this.getResource();
        if(rez && rez.$save){
          console.log("Found a valid resource to save.", rez, this.stylinType);
          rez.$save();
        }
      };
      $scope.show = function(){
        console.log("Show the dialog.", this.getResource());
        if(this.getResource()){
          dialog = $('#sub_stylin_change').modal('show');
        }
      };
      $scope.close = function(){
        console.log("close", this, dialog);
        dialog && dialog.modal('hide');
      };
      $scope.getResource = function(){
          return this.resource;
      };
      $scope.getSettings = function(){
        
      };
    },
    template:   //Copy Pasta
     '<div>' +
      '<div id="sub_stylin_change" tabindex="-1" class="modal hide" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-header">'+
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
          '<h3>{{gT("Change Sub Style")}}</h3>'+
        '</div>'+
        '<div class="modal-body">'+
          '<div class="row-fluid" ng-repeat="cfg in settings">' +
            '<span class="span4"> {{gT(cfg.t)}} </span>' + //Iterate over the available settings.
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
          '<i class="icon-cog"></i>' +
        '</button>' + 
      '</div>' +
    '</div>',
    replace: true
  };
});

