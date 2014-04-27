/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var html2js=require('./index.js');
var logger=require('./logger.js').log;

html2js.setLogger(logger);
html2js.generateMulti(__dirname + '/templates',__dirname + '/views',function(err){
    if(err){
        logger.logError('test-result error: '+err.toString());
        return;
    }else
    {
        logger.logInfo('generation complete!');
    }
    
});


