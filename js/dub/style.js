/**
 * Provides a state handler that can be used on a project item to update the status information.
 *
 * It requires a .proj to be available in the scope, so either ng-init="proj = $Resource" or something
 * similar
 * 
 *  Note: These get pretty complex pretty fast... might want to put them in a not so "Shared" location since
 * they are still going to require access to the control modules?
 */
DubMark.Modules.Dub.directive("stylin", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      var elements = [
          Name:{
            d: '',
            m: /\w+/
          },
          Fontname:{
            d: 'Arial',
            m: /\w+/
          },
          Fontsize:{
            d: 20,
            m: /\d+/
          },
          PrimaryColour:{
            d: 65535,
            m: /\d+/
          },
          SecondaryColour:{
            d: 65535,
            m: /\d+/
          },
          TertiaryColour:{
            d: 65535,
            m: /\d+/
          },
          BackColour:{
            d: -2147483640,
            m: /\d+/
          },
          Bold:{
            d: -1,
            m: /\d+/
          },
          Italic:{
            d: 0,
            m: /\d+/
          },
          BorderStyle:{
            d: 1,
            m: /\d+/
          },
          Outline:{
            d: 3,
            m: /\d+/
          },
          Shadow:
            d: 0,
            m: /\d+/
          },
          Alignment:{
            d: 2,
            m: /\d+/
          },
          MarginL:{
            d: 30,
            m: /\d{2}/
          },
          MarginR:
            d: 30,
            m: /\d{2}/
          },
          MarginV: {
            d: 30,
            m: /\d{2}/
          },
          AlphaLevel:{ 
            d: 0,
            m: /\d{1}/
          },
          Encoding: {
            d: 0,
            m: /\w+/
          }
        ];
        //Style: Default,Arial,20,65535,65535,65535,-2147483640,-1,0,1,3,0,2,30,30,30,0,0
      $scope.save = function(){
      };
      $scope.close = function(){
        console.log("close", this, dialog);
        dialog.modal('hide');
      }
    },
    template:   //Copy Pasta
     '<div>' +
      '<div id="status_change_{{proj.id}}" tabindex="-1" class="modal hide" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-header">'+
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
          '<h3>Change Status</h3>'+
        '</div>'+
        '<div class="modal-body">'+
          '<!-- Iterate over the available settings -->',
        '</div>'+
        '<div class="modal-footer">'+
          '<a ng-click="save()" href="#" class="btn btn-primary">Save</a>'+
          '<a ng-click="close()" href="#" class="btn">Close</a>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">' +
          '<div class="span2 text-center stateful " title="{{key}}"' + 
           ' ng-class=isComplete(key)' +
           ' ng-click=changeState(key)' +
           ' ng-repeat=\'key in states\' >' +
            '<i ng-class="getStateIcon(key)" {{proj.status[key]}}"/>' +
          '</div>' +
      '</div>' +
    '</div>',
    replace: true
  };
});

