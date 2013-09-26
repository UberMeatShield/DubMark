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
      this.gT      = $scope.gT;
      this.stylin  = $scope.stylin;

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
        this.stylin.loadAll();
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
      };

      $scope.addStylin = function(){
        console.log("Add Stylin.");
      };

      $scope.createStylin = function(){
        //Get active style.
        
        //Fallback to default 
        console.log("Create stylin.");
        this.stylin.newStylin();
        //Duplicate the active one.
      };

      $scope.notInProj = function(s){
        return 'hidden';
      };

      $scope.inProj = function(s){
        console.log("Check against the stylins in the project.");
        return '';
      };

      $scope.removeStylinFromProj = function(){
        //Updates the proj id array
        console.log("Remove the stylin from this project");
      };

      $scope.removeStylinFromDb = function(){
        console.log("Remove the stylin from the db");
      };
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

          '<div class="container-fluid">' +
            '<div class="span5">' +
              '<button class="btn" ng-click=addStylin()>Add to Current Project</button>' +
              '<button class="btn" ng-click=createStylin()>Create New</button>' +
              '<button class="btn" ng-click=removeStylin()>Remove Stylin</button>' +
            '<ul class="nav nav-list">' +
              '<li class={{isActive(s)}} ng-repeat="s in stylin.all"> ' +
                '<a  ng-click=editStyle(s)>' +
                '{{gT(s.title)}}' +
                '</a>' + //Do this with an input box.
                '<span ng-click=removeStylinFromProj(s) class="pull-right" ng-class=inProj(s)>Yup</span>' +
                '<span ng-click=addStylin(s) class="pull-right" ng-class=notInProj(s)>Nope</span>' +
              '</li>' +
            '</ul>' +
            '</div>' +
            '<div class="span6">' +
              'this is on the right' +

              //Add in editing related to the currently selected style in the stylin manager
            '</div>' +
          '</div>' + 

          '</div>'+ //End of modal body
          '<div class="modal-footer">'+
            '<a ng-click="close()" href="#" class="btn">Close</a>'+
          '</div>'+
        '</div>'+


        //Basic selection of styles for the particular sub.
        '<ul class="nav nav-list">' +
          '<li class="nav-header"> ' +
            '<span>{{gT("Apply Style")}}</span>' +  
            '<button id="OpenStylinConfig" class=" pull-right"' +  //This opens the modal dialog
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
      stylin: '=',
      resource: '='
    },
    controller: function($scope, $element) {
      //The settings setill need to have an order to iterate through.
      $scope.settings = JSON.parse(JSON.stringify(DubMark.Config.Style));
      $scope.gT     = DubMark.i18n.gT;

      //Hmm, doesn't seem like I can chain two directives (missing something?)
      this.resource = $scope.resource;
      this.stylin   = $scope.stylin;

      var dialog = null;
      $scope.save = function(){ //Need to merge in the settings => into the resource, THEN save.
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
        //Lookup the currently active style, merge that data into the current settings.
        
        //Look at the resource we have, check the styleName
        
        //Use the stylin manager to lookup that style, populate the UI (not found = Config.Style)
        
        //Use apply to empty to 'set' the resource element values into the resource (only on save?)
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

