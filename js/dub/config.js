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
  Style: [{  //Default SSA style
      t: 'Name',
      d: '',
      m: /\w+/
    },{
      t: 'Fontname',
      d: 'Arial',
      m: /\w+/
    },{
      t: 'Fontsize',
      d: 20,
      m: /\d+/
    },{
      t: 'PrimaryColour',
      d: 65535,
      m: /\d+/
    },{
      t: 'SecondaryColour',
      d: 65535,
      m: /\d+/
    },{
      t: 'TertiaryColour',
      d: 65535,
      m: /\d+/
    },{
      t: 'BackColour',
      d: -2147483640,
      m: /\d+/
    },{
      t: 'Bold',
      d: -1,
      m: /\d+/
    },{
      t: 'Italic',
      d: 0,
      m: /\d+/
    },{
      t: 'BorderStyle',
      d: 1,
      m: /\d+/
    },{
      t: 'Outline',
      d: 3,
      m: /\d+/
    },{
      t: 'Shadow',
      d: 0,
      m: /\d+/
    },{
      t: 'Alignment',
      d: 2,
      m: /\d+/
    },{
      t: 'MarginL',
      d: 30,
      m: /\d{2}/
    },{
      t: 'MarginR',
      d: 30,
      m: /\d{2}/
    },{
      t: 'MarginV',
      d: 30,
      m: /\d{2}/
    },{
      t: 'AlphaLevel',
      d: 0,
      m: /\d{1}/
    },{
      t: 'Encoding',
      d: 0,
      m: /\w+/
    }
  ]
};
