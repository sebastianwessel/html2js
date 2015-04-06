var bunyan = require('bunyan'),
    safeCycles = bunyan.safeCycles;
var Stomp = require('stompjs');
var isok=false;

function BunyanStomp(levels,options,callback) {
    var self = this;
    this.levels = {};
    levels.forEach(function (lvl) {
        self.levels[bunyan.resolveLevel(lvl)] = true;
    });
    if(options.websocket)
    {
        this.stomp = Stomp.overWS(options.websocket);
    }else
    {
        this.stomp = Stomp.overTCP(options.host, options.port);
    }
    
    this.stomp.connect(options.username, options.password, function(){
        isok=true;
        callback(null);
    }, 
    function(err){
        callback(err);
    });

}

BunyanStomp.prototype.write = function (rec) {
    if (this.levels[rec.level] !== undefined) {
        var str = JSON.stringify(rec, safeCycles());// + '\n';
        if(isok) this.stomp.send("/topic/servermsg", {}, str);
    }
};

module.exports.BunyanStomp=BunyanStomp;
