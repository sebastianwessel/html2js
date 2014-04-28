var log={
    level:2,
    doLog:function(loglevel,txt){
      if(this.level<this.loglevel) return;
      console.log(txt);
    },
    logError:function(txt){
        this.doLog(1,'\x1B[31m'+'error - '+'x1B[39m'+txt);
    },
    logSecurity:function(txt){
        this.doLog(2,'\x1B[31m'+'security - '+'x1B[39m'+txt);
    },
    logWarning:function(txt){
        this.doLog(3,'\x1B[33m'+'warning - '+'\x1B[39m'+txt);
    },
    logInfo:function(txt){
        this.doLog(4,'\x1B[34m'+'info - '+'\x1B[39m'+txt);
    },
    logDebug:function(txt){
        this.doLog(5,'\x1B[1m'+'debug - '+'\x1B[22m'+txt);
    }
};

module.exports.log=log;