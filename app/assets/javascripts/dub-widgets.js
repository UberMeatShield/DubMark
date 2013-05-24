/**
 * Provides a state handler that can be used on a project item to update the status information.
 *
 * It requires a .proj to be available in the scope, so either ng-init="proj = $Resource" or something
 * similar
 */
DubMark.Modules.Dub.directive("status", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      //How do I get the scope of the item hacked in?
      var dialog = null;
      $scope.isComplete = function(key){
        if($scope.proj.status[key]){
          return 'completed';
        }
      };
      $scope.changeState = function(key){
        console.log("Change status for: ", this, key);
        $scope.statusKey = key;
        $scope.text      = !this.proj.status[key] ? 'Set Done: ' + key : 'Set NOT Done: ' + key; //Updates the template

        dialog  = $('#status_change_' + $scope.proj.id).modal('show');
      };
      $scope.getStateIcon = function(key){
        return DubMark.States[key];
      };
      $scope.save = function(){
        console.log("Change status for: ", this, this.statusKey);
        if(!this.proj.status[this.statusKey]){ 
          this.proj.status[this.statusKey] = new Date();
        }else{
          this.proj.status[this.statusKey] = null;
        }
        this.proj.$save();
        dialog.modal('hide');
      };
      $scope.close = function(){
        console.log("close", this, dialog);
        dialog.modal('hide');
      }
    },
    //This seems better for using Angular vs a pure jQuery UI dialog, however it does not seem much easier to debug
    template:  
     '<div>' +
      '<div id="status_change_{{proj.id}}" tabindex="-1" class="modal hide" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-header">'+
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
          '<h3>{{text}}</h3>'+
        '</div>'+
        '<div class="modal-footer">'+
          '<a ng-click="save()" href="#" class="btn btn-primary">Save changes</a>'+
          '<a ng-click="close()" href="#" class="btn">Close</a>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">' +
          '<div class="span2 text-center"' + 
           ' ng-class=isComplete(key)' +
           ' ng-click=changeState(key)' +
           ' ng-repeat=\'key in ["VideoReady", "Timed", "Translated", "QA", "Completed", "Published"]\' >' +
            '<i ng-class="getStateIcon(key)" title="{{key}} {{proj.status[key]}}"/>' +
          '</div>' +
      '</div>' +
    '</div>',
    replace: true
  };
});


DubMark.Modules.Dub.directive('videomanager', function(){
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      console.log("VideoManager.", $scope, $element);

      $scope.setVideoUrl = function(){
        console.log("Set video url.");
      };

      $scope.changeVideo = function(){
        console.log("Change video", $scope);

        var div = $('#vid_change_' + $scope.project.id);
            div.removeClass('hidden');

        var dialog = div.dialog({
          title: 'Video Url Change',
          modal: true,
          minWidth: 500, //Hm, bootstrap width classes seem to fail...
          buttons: {
            'Save': function(){
              try{
                console.log("Save the video update");
                var vid = this.project.vid;
                this.proj.vidUrl            = vid.vidUrl;
                this.proj.status = this.proj.status || {};
                this.proj.status.VideoReady = vid.vidUrl ? new Date() : null;
                this.proj.$save();

                $('#video').empty();


                vid.createVideo(vid.vidUrl, vid.vidType);
                console.log("Update the vid url.");
                $(dialog).dialog('close');
              }catch(e){
                console.error('Failed to update the video url.', e);
              }
            }.bind(this)
          }
        });
      };
    },
    template: 
    '<div class="well span7">' +
      '<div id="video"></div>' + //Video elements are going to be added in here.
      '<div id="vid_change_{{project.id}}" class="hidden">' +
        '<input style="width:100%;" type="text" ng-model=project.vid.vidUrl placeholder="Video Url"/>' +
      '</div>' +
      '<button class="btn" ng-click=changeVideo()>' +
        '<i class="icon-plus" /> Change Video'  + 
      '</button>' +
    '</div>',
    replace: true
  };
});
