DubMark.Modules.Dub.directive("status", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      console.log("Scope args", $scope);
      //How do I get the scope of the item hacked in?
      $scope.isComplete = function(key){
        if($scope.proj.status[key]){
          return 'completed';
        }
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
          '<img ng-class="getStateIcon(key)" />' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>',
    replace: true
  };
});
