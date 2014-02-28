html2js
=======
It's an express.js template module which creates pure js functions from html templates including i18n internationalisation and translations without learning a new mark-up-language.
html2js gives you full flexibility and power of js inside your templates because you can use plain js to build your own logic.
It's blazing fast because your HTML template will be automaticly converted into pure js code during startup.

**WHY SHOULD I USE IT?**
- blazing fast because of creating pure, executable js code
- one template fits for different language/country combinations(i18n support) for simple maintaining your templates
- easy and short syntax inside of pure HTML
- template logic is NOT limited to a few fixed functions **full js functionality**
- easy extendable without touching server- or module code with pure js code
- define and re-use your own functions with pure js for better maintaining your templates

Index
====
- [Install](#install)
- [i18n internationalization](#i18n-internationalization)
- [HTML-Templates](#html-templates)
	- [inline functions](#inline-functions)
	- [self-defining](#self-defining)
	- [pre-defined functions](#pre-defined-functions)
	- [adding own pre-definied functions](#adding-own-pre-definied-functions)
	- [performance recommendations](#performance-recommendations)
- [Functions](#functions)
	- [Creation](#creation)
	- [Rendering](#rendering) 
- [Example](#example)
- [Credits](#credits)
- [License](#license)

Install
====
use node package manager npm to install html2js

    npm install html2js

or download latest source from git.

i18n internationalization
===============
Maintaining code and templates are hard and even harder as more country-languages combinations you have to maintain.
So html2js builds different templates for country-language combinations from **one single template**.
You don't have to maintain multiple templates for multiple country-language combinations! Create one template, define translations and the rest will be done by html2js.
To generate templates for multiple country-language combinations we create a file for each combination.
Name convention is *countryCode-languageCode.local* and content of file will be simple JSON.

So a local-file *uk-en.local* will look like

```JavaScript
{
    headline:"This is our headline",
    text:"Here is some text"
    ....
}
```

If you like to add a language just copy your current local-file, re-name it for example to *uk-de.local* and change the translations

```JavaScript
{
    headline:"Hier ist unsere Headline",
    text:"Da steht ein Text"
    ....
}
```

HTML-Templates
==========
Creating a template is still easy. You can take your html as it is - just insert placeholders where you need it.

**You only have to take care not to use ' somewhere in your HTML-code because it will broke-down compiled functions! Use " instead of ' to prevent this.**

**Also take care that there is a space after {{ and before }} - so {{translate.something}} will be wrong**

**Name your templates without spaces or special characters with ending *.html* example: *my template.html* will be invalid and ends up with broken compiled js code**

**Subfolders in template- or locals- directory are currently not supported**

Generally there will be a template called *layout.html* which contains the default ribbon and wraps all other templates by default.
It can look like this:
```HTML
<html>
<head>
    <title>Your title goes here</title>
</head>
<body>
    <div>{{inc header.html }}</div>
    <div>{{inc sidebar.html }}</div>
    <div>{{ body }}</div>
    <div>{{inc footer.html }}</div>
</body>
</html>
```

All other templates will be inserted on **{{ body }}**, so you dont have to include same things on each template.
By default the wrapping template is named *layout.html* but you are able to set the wrapping template during runtime.
If you like to use a template other than *layout.html* it has to be named like *layoutmytemplate.html* - so name has to start with *layout* and end up with *.html*.
This gives you the option to use more than one *layout.html*. It will be useful for example if you need different layouts for front-end and back-end.
You can use *layout.html* for front-end and add a separated layout for back-end called *layoutbackend.html*.

You can access current country code and language code in your templates:

```HTML
<div>{{ translate.currentLanguageCode }}</div>
<div>{{ translate.currentCountryCode }}</div>
```

So you can do something like this:

```HTML
<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="{{ translate.currentLanguageCode }}" lang="{{ translate.currentLanguageCode }}">
<head>
```

**Don't use *currentLanguageCode* or *currentCountryCode* as name for translations in your local-files! It will be overwritten.**

All translations for current country-language are stored in *translate* object.
You can access your translations like *translate.yourkey*.
To insert a translation just put in your html template something like this:

```HTML
.....
<h1>{{ translate.headline }}</h1>
<p>{{ translate.text }}</p>
.....
```

Data which is created during runtime will be stored in *data* object.
You can acces your data like *data.myvalue*.
To output some dynamic data during runtime - for example some things you read from database or such stuff:

```HTML
.....
<div>{{ data.var1 }}</h1>
<p>{{ data.var2 }}</p>
.....
```

To include other template parts (partials) just use something like this:

```HTML
.....
<div>{{inc sidebar.html }}</div>
<div>{{inc footer.html }}</div>
.....
```

You are also able to implement logic-functions with full power of js to execute some code during runtime.
There are three options available to implement your own template logic.

inline functions
-----------------
Because of inline-functions you are able to execute functions or small code.
To add something to your output you have to call *ret+=[...your value...];*.

```JavaScript
....
{{inline
    ret+=(data.x+1); //outputs value x+1
    ret+=data.something.toUpperCase(); //outputs something in lower cases
    ret+=translate.somelabel+': '+data.somevalue;
    ret+=myFunction(data.x); //call a function and out returned value
}}
....
```

self-defining
---------------
Sometimes you need a more complex functionality or you like to copy and paste some functions.
For this cases you can define the code for a function like a regular function without setting a name or parameters.
Just write your code and use *return* to return and output your data.

```JavaScript
.....
{{fn
        var r='';
        for(var x=0,x_max=data.a.length;x<x_max;x++)
        {r+=data.a[x];} 
        return r+' '+translate.message;
}}
.....
```

The example above will be compile into something like:

```JavaScript
function fn123(data,translate)
{
    var r='';
    for(var x=0,x_max=data.a.length;x<x_max;x++)
    {
        r+=data.a[x];
    } 
    return r+' '+translate.message;
}
```

{{fn ... }} will wrap everything into a separate function and you can access translations and data. You only have to return a value.
As you can see you got access to your data and your current local translation object.
**But keep eyes on what you are doing and if its necessary to do it on each request. It maybe hurts your performance.**
Self-defining functions will become a name automaticly on each generation.

pre-defined functions
------------------------------
You can use some build-in function out-of-box:

-encode(value);

```JavaScript
{{inline
    if(data.x>0)
    {
        ret+=translate.results+':<br/>';
        ret+=encode(data.something);
    }else
    {
        ret+=translate.nothingFound;
    }
}}
```


adding own pre-definied functions
----------------------------------------
To add your own functions you can also create a regular js-file inside of templates directory and name it **functions.js**.
You can for example add a code like this:

```JavaScript
    function outputSelectOptions(val)
    {
        var ret='';
        for(var x=0,x_max=val.length;x<x_max;x++)
        {
            ret+='<option value="'+val[x].key+'">'+val[x].label+'</option>';
        }
        return ret;
    }
```

...and on any of your templates you can add this functionality like:

```HTML
    <select name="myselect">
        {{inline outputSelectOptions(data.variable); }}
    </select>
    <select name="myotherselect">
        {{inline outputSelectOptions(data.othervar); }}
    </select>
```

...and this will output something like:

```HTML
    <select name="myselect">
        <option value="1">good</option>
        <option value="2">better</option>
        ...
    </select>
    <select name="myotherselect">
        <option value="de">germany</option>
        <option value="at">austria</option>
        ...
    </select>
```

performance recommendations
-----------------------------------
For example reading a value from a database and (un)escaping this string on each request isn't optimal - try to store the (un)escaped string into database and save time for (un)escaping on each request.
As we return HTML it makes most time no sense to do something like:

```JavaScript
    {{inline data.val1.toUpperCase() }}
    {{inline data.val2.toLowerCase() }}
```

You can use css on client side and don't need to convert it on server-side on each request in most cases.

Functions
======

Creation
----------
To create js functions from html templates and i18n locals you have to call

```JavaScript
    createTranslationTemplates(HTML_TemplateDirectory,locals_Directory,ViewOutputDirectory,Callback);
```

For each i18n-local file this function will create a translated version of each template and will store generated html files in subfolders under ViewOutputDirectory.
It also creates a file **compiled.js** for each local-file which will be also stored in subfolder under ViewOutputDirectory. This file will contain pure js-functions.

**createTranslationTemplates will do a lot of synchronous stuff!
Use it when you start your server but not on any request handler**


Rendering
-----------
To render your template you can use regular express.js function *res.render* which can have up to 3 parameters.

```JavaScript
res.render(template,options,callback);
```

**parameter template**
- contains a string where you can set name of template to use for rendering
- structure will be like *uk/en/index* where we set countryCode/languageCode/templateName (without *.html* suffix)

**parameter options**
- contains data we like to render into our template
- can set layout-template different to *layout.html* or disable use of layout-template

example:

```JavaScript
var options={
    layout:'layoutothertemplate', //layout:'' means don't use any layout-template
    data:{
        myvar: 'value to set',
        othervar: 'other value to set'
        ......
    }
}
```

If *options.layout* is not set *layout.html* will be used by default. To disable layout template and render given template only (useful for example on Ajax requests) set *options.layout* to empty string.

**parameter callback**

Will be a callback-function which will be called after finishing creation of HTML-content.
This function has two parameters.

```JavaScript
callback(err,html);
```

...where err is null if everything was ok or contains an Error object if something went wrong. Parameter html will contain HTML-content as string.


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
    |    |-- functions.js
    |     ....
    |-- views
    .....

First of all you have to tell your programm that we need html2js-module

```JavaScript
var html2js=require('html2js');
```

Then we have to tell express.js where to find template-files used during runtime

```JavaScript
app.set('views', __dirname + '/views');
```

To build template-files into directory "views" we have to call

```JavaScript
html2js.createTranslationTemplates(__dirname + '/templates',__dirname + '/locals',app.get('views'),function(err){
   app.set('view engine', 'html' );
   app.engine('html', html2js.__express );
   app.enabled('view cache');
});
```

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
    |    |-- functions.js
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

```JavaScript
res.render('ch/fr/index',{data:{var1:'value of var 1',a:[1,2,3,4,5,6,7,8]}});
```

You can see we select country-language version and template by setting first parameter to *CountryCode/LanguageCode/TemplateName*. On second parameter we can set values for render output.

```JavaScript
res.render('ch/fr/index',{layout:'',data:{var1:'value of var 1',a:[1,2,3,4,5,6,7,8]}});
```
In example above we render our template *index* without wrapping it into default *layout*-template.

To wrap your template into different *layout*-template:

```JavaScript
res.render('ch/fr/index',{layout:'layoutbackend',data:{var1:'value of var 1',a:[1,2,3,4,5,6,7,8]}});
```

Credits
=====
This template engine was also inspired by doT.js http://olado.github.io/doT/index.html and Gaikan https://github.com/Deathspike/gaikan/

License
=====
Copyright (c) 2014 Sebastian Wessel
MIT License - see LICENSE
