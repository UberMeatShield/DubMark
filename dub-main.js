DubMark = Ember.Application.create({
  ready: function(){
    console.log("Application is actually ready to start.");
  }
});

DubMark.SubModel = Ember.Object.extend({
  start: '',
  end: '',
  text: ''
});
DubMark.ApplicationView = Ember.View.extend({
  templateName: 'application'
});
DubMark.ApplicationController = Ember.ArrayController.extend({
  content: []
});
DubMark.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/'
    })
  })
});
DubMark.app = DubMark.ApplicationController.create();
