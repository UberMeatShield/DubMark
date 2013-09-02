DubMark = window.DubMark || {};

DubMark.Config = {
  DEBUG: true, //For eventual console log debugging.
  base: {
    url: '' //Assume same server url
  },
  projects:{ //The listings of the projects
    url: 'projects'
  },
  subs: { //Ja subtitles, jaaa
    url: 'subs'
  },
  videos: { //Get video location & hopefully proper headers?
    url: 'vid'
  },
  getUrl: function(name){
    var C = DubMark.Config;
    var url = C[name] ? C[name].url : name;
    if(url){
      if(url.match('http')){
         console.log("URL", url);
         return url;
      }else if(C.base.url){ //Use reletive paths unless we are told otherwise
        console.log("URL", C.base.url + url);
        return C.base.url + url;
      }else{
        console.warn('No DubMark.Base.url set was set, guessing that (', name,  ') is simply the correct path.');
        return name;
      }
    }
    throw 'Cannot find config for ' + name;
  },
  StatesOrder: ["VideoReady", "Timed", "Translated", "QA", "Published"],
  States: { //Icons for the various UI elements
    New: 'icon-plus',
    VideoReady: 'icon-facetime-video',
    Timed: 'icon-time',
    Translated: 'icon-comment',
    QA: 'icon-thumbs-up',
    Completed: 'icon-ok',
    Published: 'icon-share'
  },
  Style: { //A default SSA style.
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
    Shadow:{
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
    MarginR:{
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
  }
};
