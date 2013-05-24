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
      $scope.isComplete = function(key){
        if($scope.proj.status[key]){
          return 'completed';
        }
      };
      $scope.changeState = function(key){
        console.log("Change status for: ", div, key);

        this.statusKey = key;
        var div = $('#status_change_' + $scope.proj.id); 
            div.removeClass('hidden');

        var text = !this.proj.status[key] ? 'Set Done: ' + key : 'Set NOT Done: ' + key;
        var dialog = div.dialog({
          title: text,
          modal: true,
          buttons: {
            'Save': function(){  
              //Set vs unset
              if(!this.proj.status[this.statusKey]){ 
                this.proj.status[this.statusKey] = new Date();
              }else{
                this.proj.status[this.statusKey] = null;
              }
              this.proj.$save();

              //Close the dialog post save.
              $(dialog).dialog('close');
            }.bind(this)
          }
        });
      };

      $scope.getStateIcon = function(key){
        return DubMark.States[key];
      };
    },
    template: 
    '<div class="container-fluid">' +
      '<div id="status_change_{{proj.id}}" class="hidden">' + //Hidden container for the popup
        'Confirm State Change' +
      '</div>' +
      '<div class="row-fluid">' +
          '<div class="span2 text-center"' + 
           ' ng-class=isComplete(key)' +
           ' ng-click=changeState(key)' +
           ' ng-repeat=\'key in ["New", "Timed", "Translated", "QA", "Completed", "Published"]\' >' +
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
          minWidth: 500,
          buttons: {
            'Save': function(){
              try{
                console.log("Save the video update");
                var vid = this.project.vid;
                this.proj.vidUrl  = vid.vidUrl;
                this.proj.vidType = vid.vidType;
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
