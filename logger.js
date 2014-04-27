var log={
    level:2,
    doLog:function(loglevel,txt){
      if(this.level<this.loglevel) return;
      console.log(txt);
    },
    logError:function(txt){
        this.doLog(1,'error - '+txt);
    },
    logSecurity:function(txt){
        this.doLog(2,'security - '+txt);
    },
    logWarning:function(txt){
        this.doLog(3,'warning - '+txt);
    },
    logInfo:function(txt){
        this.doLog(4,'info - '+txt);
    },
    logDebug:function(txt){
        this.doLog(5,'debug - '+txt);
    }
};

module.exports.log=log;