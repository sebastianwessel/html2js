html2js
=======
It's an express.js template module which creates pure js functions from html templates including i18n internationalization and translations without learning a new mark-up-language.
html2js gives you full flexibility and power of js inside your templates.



Install
====
use node package manager npm to install html2js

    npm install html2js

or download latest source from git.

i18n internationalization
===============
To generate templates for multiple country-language-combinantions we create a file for each combinantion.
Name convention is *countryCode-languageCode.local* and content of file will be simple JSON.

So a local-file *uk-en.local* will look like

    {
        headline:"This is our headline",
        text:"Here is some text"
        ....
    }

If you like to add a language just copy your current local-file, re-name it for example to *uk-de.local* and change the translations

    {
        headline:"Hier ist unsere Headline",
        text:"Da steht ein Text"
        ....
    }


HTML-Templates
==========
Creating a template is still easy. You can take your html as it is - just insert placeholders where you need it.

**You only have to take care not to use ' somwhere in your HTML-code because it will broke-down compiled functions! Use " instead ' to prevent this.**

**Also take care that there is a space after {{ and before }} - so {{translate.something}} will be wrong**

You can access current country code and language code in your templates:

    <div>{{ translate.currentLanguageCode }}</div>
    <div>{{ translate.currentCountryCode }}</div>
So you can do something like this:

    <!doctype html>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="{{ translate.currentLanguageCode }}" lang="{{ translate.currentLanguageCode }}">
    <head>

**Don't use *currentLanguageCode* or *currentCountryCode* as name for translations in your local-files! It will be overwritten.**

To insert a translation just put in your html template something like this:

    .....
    <h1>{{ translate.headline }}</h1>
    <p>{{ translate.text }}</p>
    .....

To output some dynamic data during runtime - for example some things you read from database or such stuff:

    .....
    <div>{{ data.var1 }}</h1>
    <p>{{ data.var2 }}</p>
    .....

To include other template parts (partials) just use something like this:

     .....
    <div>{{inc sidebar.html }}</div>
    <div>{{inc footer.html }}</div>
    .....

You are also able to implement logic with full power of js to execute some code during runtime:

    .....
    <div>{{fn var r='';
            for(x=0,x_max=data.a.length;x<x_max;x++)
            {r+=data.a[x];} 
            return r+' '+translate.message;
    }}</div>
    .....

So in the example above it will compile something like:

    function fn123(data,translate)
    {
        var r='';
        for(x=0,x_max=data.a.length;x<x_max;x++)
        {
            r+=data.a[x];
        } 
        return r+' '+translate.message;
    }

{{fn ... }} will wrap everthing into a seperate function and you can access translations and data. You only have to return a value.
**But keep eyes on what you are doing and if it's necessary to do it on each request. It hurts your performance.**
For example reading a value from a database and (un)escaping this string on each request isn't optimal - try to store the (un)escaped string into database and save time for (un)escaping on each request.
As we return HTML it makes most time no sense to do something like:

    {{fn data.val1.toUpperCase() }}
    {{fn data.val2.toLowerCase() }}

You can use css on client side and don't need to convert it on server-side on each request in most cases.

Functions
======
To create js functions from html templates and i18n locals you have to call

    createTranslationTemplates(HTML_TemplateDirectory,locals_Directory,ViewOutputDirectory,Callback)

For each i18n-local file this function will create a translated version of each template and will store generated html files in subfolders under ViewOutputDirectory.
It also creates a file **compiled.js** for each local-file which will be also stored in subfolder under ViewOutputDirectory. This file will contain pure js-functions.

**createTranslationTemplates will do a lot of synchronous stuff!
Use it when you start your server but not on any request handler**

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

After calling *createTranslationTemplates* you project structure should look like this

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
    |    |-- uk
    |    |    |-- en
    |    |         |-- compiled.js
    |    |         |-- layout.html
    |    |         |-- index.html
    |    |         |-- sidebar.html
    |    |
    |    |-- ch
    |         |-- en
    |         |    |-- compiled.js
    |         |    |-- layout.html
    |         |    |-- index.html
    |         |    |-- sidebar.html
    |         |
    |         |-- fr
    |              |-- compiled.js
    |              |-- layout.html
    |              |-- index.html
    |              |-- sidebar.html
    .....

Now we are able to use it like any other template engine

    res.render('ch/fr/index',{data:{var1:'value of var 1',a:[1,2,3,4,5,6,7,8]}});

You can see we select country-language version and template by setting first parameter to *CountryCode/LanguageCode/TemplateName*. On secound parameter we can set values for render output.
