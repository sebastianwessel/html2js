function include(data){
var ret= '<div>this is from include file</div>';
return ret;
}
module.exports.include=include;

function test(data){
var ret= '<html><head><title>daten 1 von _default.json</title><script> /* some multiline comment * which should be removed */ function testjs(param) { //single line comment alert(param); } testjs(\'this is a test\'); </script></head><body> some text daten 1 von _default.json with some daten 2 von _default.json and test 1 von content.json and additional{{ translate.not.set }}'+include(data)+'{{inc non_existing.html }}</body></html>';
return ret;
}
module.exports.test=test;

var translate={"sample1":"daten 1 von _default.json","sample2":"daten 2 von _default.json","content":{"test1":"test 1 von content.json","test2":"test 2 content.json"},"login":{"name":"bitte namen eingeben","password":"bitte passwort eingeben"}};
module.exports.translate=translate;


/* 
 * pre-build functions which will be included in every compiled.js file
 * DO NOT CHANGE THIS FILE!
 * To add your own functions create a file named functions.js in your templates-folder.
 * functions.js will be automaticly included in every compiled.js file.
 */

function encode(txt)
{
    var escapeExp = /[&<>"]/,
    escapeAmpExp = /&/g,
    escapeLtExp = /</g,
    escapeGtExp = />/g,
    escapeQuotExp = /"/g;

    var res = txt.toString();
    if (!escapeExp.test(res)) {
        return res;
    }
    return res.replace(escapeAmpExp, '&#38;').replace(escapeLtExp, '&#60;').replace(escapeGtExp, '&#62;').replace(escapeQuotExp, '&#34;');
};


