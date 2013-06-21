

DubMark.i18n = {};
DubMark.i18n.ENU = {
  NewSub: 'Create a new Subtitle',
  NextSub: '',
  PrevSub: '',
  JumpSubStart: '',
  JumpSubEnd: '',

  StopVideo: '',
  StartVideo: '',
  PauseVideo: ''
};
DubMark.i18n.Lang = DubMark.i18n_DEFAULTS || DubMark.i18n.ENU;

/**
 *  Make it so you can specify what to init by known languages?
 */
DubMark.i18n.getInstance = function(lang){
  if(!DubMark.i18n.Instance){
    DubMark.i18n.Instance = new DubMark.i18n.Language(lang || DubMark.i18n.default);
  }
  return DubMark.i18n.Instance;
}
DubMark.i18n.getLabel = function(key){
  DubMark.i18n.getInstance().getKey(key);
};


/**
 * A language instances
 */
DubMark.i18n.Language = function(lang){
  this.init(lang);
};
$.extend(DubMark.i18n.Language.prototype, {
  init: function(lang){
    this.setStrings(lang);
  },
  setKey: function(key, string){ //Why bother with a function right?  Because they don't need to know :)?
    this.key = string;
  },
  setStrings: function(){

  }
});
