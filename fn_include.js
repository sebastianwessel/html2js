/* 
 * pre-build functions which will be included in every compiled.js file
 * DO NOT CHANGE THIS FILE!
 * To add your own functions create a file named functions.js in your templates-folder.
 * functions.js will be automaticly included in every compiled.js file.
 */

function escape(txt)
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


