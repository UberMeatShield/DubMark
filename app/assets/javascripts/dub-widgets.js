
DubMark.Modules.Dub.directive("stats", function() {
    return {
      restrict: "E",
      transclude: true,
      scope: {},
      controller: function($scope, $element) {
        console.log("Stats directive scope and element.", $scope, $element);
      },
      template: 
        '<div class="span1" ng-class="list.isComplete(key)">' +
          '<img ng-class="list.getStateIcon(key)" title="{{key}} {{list.active.status[key]}}"  />' +
        '</div>',
/*
        '<div class="tabbable">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
*/
      replace: true
    };
});
