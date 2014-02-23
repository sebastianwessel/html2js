html2js
=======

express.js template module which creates pure js functions from html templates including i18n internationalization and translation

Install
====

use node package manager npm to install html2js

npm install html2js

or download latest source from git.

i18n internationalization
===============



Example
=====

Your project structure should look like this:

projectRoot
 |
 |-- locals
 |    |
 |    |-- uk-en.local
 |    |-- ch-en.local
 |    |-- ch-fr.local
 |    ....
 |-- templates
 |    |
 |    |-- layout.html
 |    |-- index.html
 |    |-- sidebar.html
 |     ....
 |-- views
 .....

First of all you have to tell your programm that we need html2js-module

var html2js=require('html2js');

Then we have to tell express.js where to find template-files used during runtime

app.set('views', __dirname + '/views');

To build template-files into directory "views" we have to call

html2js.createTranslationTemplates(__dirname + '/templates',__dirname + '/locals',app.get('views'),function(err){
    app.set('view engine', 'html' );
    app.engine('html', html2js.__express );
    app.enabled('view cache');
});
