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
      $scope.changeState = function(){
          //Create a dialog (or just get a singleton and point it at this proj)
          //
          //DubMark.GetStateDialog($scope.proj); //this?
      };
      $scope.getStateIcon = function(key){
        return DubMark.States[key];
      };
    },
    template: 
    '<div class="container-fluid">' +
      '<div class="row-fluid">' +
        '<div class="text-center " ng-repeat=\'key in ["New", "Timed", "Translated", "QA", "Completed",           "Published"]\' >' +
          '<div class="span2" ng-class="isComplete(key)">' +
          '<img ng-class="getStateIcon(key)" title="{{key}} {{proj.status[key]}}"/>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>',
    replace: true
  };
});
