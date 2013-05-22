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
            '<img ng-class="getStateIcon(key)" title="{{key}} {{proj.status[key]}}"/>' +
          '</div>' +
      '</div>' +
    '</div>',
    replace: true
  };
});
