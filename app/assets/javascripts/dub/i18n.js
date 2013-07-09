

DubMark.i18n = {};
DubMark.i18n.ENU = {
  NewSub: 'Create a new Subtitle',
  EndSub: 'End the current subtitle',
  RemoveSub: 'Remove the selected subtitle',
  PauseAndEndSub: 'Pause the video, end subtitle',
  SetStart: 'Set the start of the sub to video time',
  SetEnd: 'Set the end of the sub to video time',
  NextSub: 'Select the next sub in the list',
  PrevSub: 'Select the previous sub in the list',
  JumpSubStart: 'Jump the video to the start of this subtitle',
  JumpSubEnd: 'Jump the video to the end of this subtitle',

  FocusTranslation: 'Focus on the translation entry',
  FocusSource: 'Focus on the source entry',

  ToggleVideo: 'Play and Pause the video',
  StopVideo: 'Stop this video', //Do I even use this?
  StartVideo: 'Start the video',
  PauseVideo: 'Pause the video',
  ToggleHotkeys: 'Toggle the hotkeys on and off, esc'
};
DubMark.i18n.Lang = DubMark.i18n_DEFAULTS || DubMark.i18n.ENU;

/**
 *  Make it so you can specify what to init by known languages?
 */
DubMark.i18n.getInstance = function(lang){
  if(!DubMark.i18n.Instance){
    DubMark.i18n.Instance = new DubMark.i18n.Language(lang || DubMark.i18n.Lang);
  }
  return DubMark.i18n.Instance;
}
DubMark.i18n.getLabel = function(key){
  DubMark.i18n.getInstance().getKey(key);
};
gT = function(key){
  return DubMark.i18n.getLabel(key);
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
  getKey: function(key){
    return this[key] || key;
  },
  setStrings: function(lang){
    console.log("What are we iterating on?", lang);
    $.each(lang, function(k, v){
      this[k] = v;
    }, this);
  }
});
