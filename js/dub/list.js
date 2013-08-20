/**
 *  Loading support for getting paginated lists and loading a new project
 */
DubMark.ProjectList = function(args){
  this.init(args);
};

$.extend(DubMark.ProjectList.prototype, {
  sequence: {id: 0},
  init: function(args){
     this.arr = args && args.data ? args.data : [];
     this.active = null;
     this.deferTime   = 500;

     //Search oriented items.
     this.filterTitle = ''
     this.page        = 0;
     this.state       = '';
  
     DubMark.Store.ProjectList[this.sequence.id++] = this;
  },
  load: function(){
    //Ajax call to the server, attempt to load the list of projects we have avail
    this.ResourceProject = this.ResourceProject || new DubMark.MockProjectResource();
    this.arr = this.ResourceProject.query(function(wtf){
      console.log("Project list loaded successfully.");
    });
  },
  filterChange: function(){
    this.page = 0; //Reset the page we are on (pagination)
    this.search();
  },
  next: function(){
    this.page++;
    console.log("The page we are on.", this.page);
    this.search();
  },
  prev: function(){
    this.page--;
    console.log("The page we are on.", this.page);
    this.search();
  },
  search: function(){
    try{
      var cb = function(){
        if(this.filterTitle != ''){
          this.arr = this.ResourceProject.query({
            title: this.filterTitle,
            state: this.state,
            page:  this.page
          })
        }else{
          this.load();
        }
      }.bind(this);
      this.deferOp(cb);
    }catch(e){
      console.error("Failed to filter hange.", e)
    }
  },
  deferOp: function(cb){
    this.lastTimeChanged = new Date();
    if(this.callIt || typeof cb != 'function'){return;}

    this.callIt = function(cb){
      try{
        var d = new Date();
        if((d - this.lastTimeChanged) > this.deferTime){
          this.callIt = null;
          this.lastTimeChanged = null;
          cb();
        }else{
          setTimeout(this.callIt.bind(this, cb), this.deferTime+50); 
        }
      }catch(e){
        console.error('Error on the save defer.', e);
      }
    }.bind(this, cb);
    this.callIt();
  },
  isComplete: function(key){
    if(this.active && this.active.status && this.active.status[key]){
      return 'completed';
    }
    return '';
  },
  getStateIcon: function(key){
    var icon =  DubMark.States[key];
    if(key && this.active){
      if(this.active.status[key]){
        return icon;
      }
    }
    return icon;
  },
  getStates: function(){
    var newStates = {};
    for (key in DubMark.States){
      if(typeof key == 'string'){
        newStates[key] = null;
      }
    }
    newStates.New = new Date();
    return newStates;
  },
  validateCreate: function(response){
    if(!response || !response.id){
      console.error("Failed to create.", response);
      return;
    }
    this.arr.unshift(response); //Might not need to do this?
    this.setActive(response);
  },
  refresh: function(){
    this.load();
  },
  setActive: function(proj){
    console.log("Set Active", proj);
    if(proj){
      this.active = proj;
    }
  },
  disableCreate: function(){
    this.disabledCreateButton = true;
  },
  enableCreate: function(){
    setTimeout(function(){
      this.disabledCreateButton = false;
    }.bind(this), 500);
  },
  openActive: function(){
     if(this.active && this.active.id){
       this.ResourceProject.open(this.active.id);
     }
  },
  isActive: function(proj){
    if(this.active && this.active.id == proj.id){
      return 'info'; 
    }
  }
});


