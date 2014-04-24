/**
 *
 * @type type It's an express.js template module which creates pure js functions from html templates including i18n internationalization and translations without learning a new mark-up-language.
 * html2js gives you full flexibility and power of js inside your templates because you can use plain js to build your own logic.
 * 
 * @author Sebastian Wessel
 * @licence MIT
 * @url https://github.com/sebastianwessel/html2js
 */
var fs = require('fs');

var options={
    templateDir:'./templates',
    localsDir:'./locals',
    outputDir:'./views'
};


function generate(templateDir,localsDir,outputDir,callback)
{
    callback = (typeof callback === 'function') ? callback : function () {};
    generateRecursive(templateDir,localsDir,outputDir);
    return callback();
}

function generateRecursive(templateDir,localsDir,outputDir)
{
    

    fs.stat(outputDir, function(err, stats) {
        if(err || !stats.isDirectory()) {
            return callback(new Error('unable to access output directory '+outputDir));
        } 
    });
    
    fs.readdir(templateDir, function(err,templatefiles){
        if(err) return callback(new Error('unable to access template directory '+templateDir));
        var templates=[];
        var stat=null;
        templatefiles.forEach(function(f){
            stat=fs.statSync(templateDir+'/'+f);
            if (stat && stat.isDirectory()) {
                console.log('found directory '+f);
                //createTranslationTemplates(templateDir+'/'+f,localsDir+'/'+f,outputDir+'/'+f,callback);
                var locals_sub=localsDir+'/'+f;
                var output_sub=outputDir+'/'+f;
                var template_sub=templateDir+'/'+f;

                try{
                    stats=fs.statSync(locals_sub);
                }catch(e)
                {
                    console.log('skip "'+f+'" no translations for '+template_sub);
                    return;
                }
                if(!stats.isDirectory())
                {
                    console.log('skip "'+f+'" no translations for '+template_sub);
                }else
                {
                    try{
                        stats=fs.statSync(output_sub);
                    }catch(e)
                    {
                        console.log('creating '+output_sub);
                        fs.mkdirSync(output_sub);
                    }
                    if(!stats.isDirectory())
                    {
                        console.log('creating '+output_sub);
                        fs.mkdirSync(output_sub);
                    }
                }
                generateRecursive(template_sub,locals_sub,output_sub);
            }else
            {
                templates.push(f);
            }

        });
        
        if(templates.length>0)
        {
            console.log('generating: '+templateDir);
            generateDir(templateDir,templates,localsDir,outputDir);
        }else
        {
            console.log('skip: '+templateDir+' found '+templates.length+' templates');
        }
        
    });
}



function generateDir(templateDir,templatefiles,localsDir,outputDir)
{
    fs.readdir(localsDir, function(err,localsfiles){
        if(err) return callback(new Error('unable to access locals directory '+localsDir));

        var translation,languageCode,countryCode,countryLng,err,t,localsContent,output;
        var m,n,js='',addjs='';

        for(var x=0,x_max=localsfiles.length;x<x_max;x++)
        {
            m = localsfiles[x].match(/.{2}-.{2}\.local/);

            if(m)
            {
                countryLng=localsfiles[x].split('.');
                countryLng=countryLng[0].split('-');
                countryCode=countryLng[0].toLowerCase();
                languageCode=countryLng[1].toLowerCase();

                err = createOutputDir(outputDir,countryCode,languageCode);
                if(err!==null) return callback(new Error('unable to access output directory for '+countryCode+'-'+languageCode));

                localsContent=fs.readFileSync(localsDir+'/'+localsfiles[x]);
                translation=JSON.parse(localsContent);

                translation.currentCountryCode=countryCode;
                translation.currentLanguageCode=languageCode;

                js='';
                for(var y=0,y_max=templatefiles.length;y<y_max;y++)
                {
                    n=templatefiles[y].substr( templatefiles[y].lastIndexOf('.') );
                    if(n=='.js')
                    {
                        addjs+=fs.readFileSync(templateDir+'/'+templatefiles[y],'utf8');
                    }else if(n=='.html')
                    {
                        err=translateTemplate(templateDir+'/'+templatefiles[y],outputDir+'/'+countryCode+'/'+languageCode+'/'+templatefiles[y],translation);
                        if(err) {
                            console.log(err);
                            return err;
                        }

                        t=generateJS(
                            countryCode,
                            languageCode,
                            templatefiles[y],
                            templatefiles,
                            fs.readFileSync(outputDir+'/'+countryCode+'/'+languageCode+'/'+templatefiles[y],'utf8')
                                    );
                        js+=t+'\n';
                    }

                }

                js+='var translate='+localsContent+';\n';
                js+='module.exports.translate=translate;\n';
                addjs+='\n'+fs.readFileSync(__dirname+'/fn_include.js','utf8');
                js+='\n'+addjs;



                output=outputDir+'/'+countryCode+'/'+languageCode+'/compiled.js';
                fs.writeFileSync(output,js,{encoding:'utf8'});

            }

        }

    });
}


/*
 * Reads template files from templateDir and replaces placeholders with translations from local-files in laocalsDir.
 * Translated templates will be stored in subdirectories of outputDir.
 * createTranslationTemplates calls callback when finished.
 * 
 * @param {String} templateDir
 * @param {String} localsDir
 * @param {String} outputDir
 * @param {Function} callback
 */
function createTranslationTemplates(templateDir,localsDir,outputDir,callback)
{
    callback = (typeof callback === 'function') ? callback : function () {};

    fs.stat(outputDir, function(err, stats) {
        if(err || !stats.isDirectory()) {
            return callback(new Error('unable to access output directory '+outputDir));
        } 
    });
    
    fs.readdir(templateDir, function(err,templatefiles){
        if(err) return callback(new Error('unable to access template directory '+templateDir));
                
        fs.readdir(localsDir, function(err,localsfiles){
            if(err) return callback(new Error('unable to access locals directory '+localsDir));
            
            var translation,languageCode,countryCode,countryLng,err,t,localsContent,output;
            var m,n,js='',addjs='';
            
            for(var x=0,x_max=localsfiles.length;x<x_max;x++)
            {
                m = localsfiles[x].match(/.{2}-.{2}\.local/);
                
                if(m)
                {
                    countryLng=localsfiles[x].split('.');
                    countryLng=countryLng[0].split('-');
                    countryCode=countryLng[0].toLowerCase();
                    languageCode=countryLng[1].toLowerCase();
                    
                    err = createOutputDir(outputDir,countryCode,languageCode);
                    if(err!==null) return callback(new Error('unable to access output directory for '+countryCode+'-'+languageCode));
                    
                    localsContent=fs.readFileSync(localsDir+'/'+localsfiles[x]);
                    translation=JSON.parse(localsContent);
                    
                    translation.currentCountryCode=countryCode;
                    translation.currentLanguageCode=languageCode;
                    
                    js='';
                    for(var y=0,y_max=templatefiles.length;y<y_max;y++)
                    {
                        n=templatefiles[y].substr( templatefiles[y].lastIndexOf('.') );
                        if(n=='.js')
                        {
                            addjs+=fs.readFileSync(templateDir+'/'+templatefiles[y],'utf8');
                        }else if(n=='.html')
                        {
                            err=translateTemplate(templateDir+'/'+templatefiles[y],outputDir+'/'+countryCode+'/'+languageCode+'/'+templatefiles[y],translation);
                            if(err) {
                                console.log(err);
                                return err;
                            }

                            t=generateJS(
                                countryCode,
                                languageCode,
                                templatefiles[y],
                                templatefiles,
                                fs.readFileSync(outputDir+'/'+countryCode+'/'+languageCode+'/'+templatefiles[y],'utf8')
                                        );
                            js+=t+'\n';
                        }
                        
                    }
                    
                    js+='var translate='+localsContent+';\n';
                    js+='module.exports.translate=translate;\n';
                    addjs+='\n'+fs.readFileSync(__dirname+'/fn_include.js','utf8');
                    js+='\n'+addjs;
                    
                    
                    
                    output=outputDir+'/'+countryCode+'/'+languageCode+'/compiled.js';
                    fs.writeFileSync(output,js,{encoding:'utf8'});
                    
                }
                
            }
            
        });
        
    });
    

    return callback(null);
}


/*
 * Checks if subdirectory in outputDir for given countryCode and languageCode exists.
 * If subdirectory does not exist this function will create necessary subdirectories.
 * On success null will be returned otherwise an error will be returned.
 * 
 * @param {String} outputDir
 * @param {String} countryCode
 * @param {String} languageCode
 * @return {null|Error}
 */
function createOutputDir(outputDir,countryCode,languageCode)
{
    var ret=true;
    var stats=null;
    try
    {
        try{
            stats=fs.statSync(outputDir+'/'+countryCode);
            if(!stats.isDirectory())
            {
                fs.mkdirSync(outputDir+'/'+countryCode);
            }
        }catch(err){
            fs.mkdirSync(outputDir+'/'+countryCode);
        }

        try{
            stats=fs.statSync(outputDir+'/'+countryCode+'/'+languageCode);
            if(!stats.isDirectory())
            {
                fs.mkdirSync(outputDir+'/'+countryCode+'/'+languageCode);
            }
        }catch(err){
            fs.mkdirSync(outputDir+'/'+countryCode+'/'+languageCode);
        }    
        return null;
    }catch(e)
    {
        return(new Error('Unable to create directories for '+countryCode+'-'+languageCode));
    }
}

/*
 * This function reads content of file input, replaces placeholders with translations from JSON-object translate and writes result ro output file
 * @param {String} input
 * @param {String} output
 * @param {Object} translate
 * @return {null|Error}
 */
function translateTemplate(input,output,translate)
{

    try
    {
        var data=fs.readFileSync(input,'utf8')
        var d=data;
        d=data.replace(/\{\{ (translate\.[\s\S]+?(\}?)+) \}\}/g , function(match,trans){ 
            //var i=trans.replace(/translate\./,'translation.');
            var v = eval(trans);
            if(typeof v!=='undefined' && v!==null)
            {
                return v;
            }else
            {
                console.log('warning: '+trans+' '+(typeof v)+' for '+translate.currentCountryCode+'-'+translate.currentLanguageCode+' but used in template '+input);
                return match;
            }

        });
        fs.writeFileSync(output,d,{encoding:'utf8'});
        return null;
    }catch(e)
    {
        return e;
    }
}


function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}


function escape(t)
{
    var ret=t;
    ret=ret.replace(/(.)(')/g,function(match,p1){
    //ret=ret.replace(/(?:[^\\])(')/,function(match,p1){
        var r=match;
        if(r.substr(0,1)==='\\')
        {
            r=match.replace(/'/,'\\\\\'');
        }else
        {
            r=match.replace(/'/,'\\\'');
        }
        return r;
    });
    return ret;
}

/*
 * This function takes translated html template content for one country-language-combinantion and creates js code.
 * Generated js code will be returned as String.
 * 
 * @param {String} countryCode
 * @param {String} languageCode
 * @param {String} templateName
 * @param {Array} allTemplates
 * @param {String} templateContent
 * @returns {String}
 */
function generateJS(countryCode,languageCode,templateName,allTemplates,templateContent)
{
    var t=templateContent;
    var fname=templateName.replace(/.html/,'');
    var userfn=[];
    var isLayout=strStartsWith(fname,'layout');
    
    //remove space, tabs, pagebreaks before and after markup {{...}}
    t=t.replace(/([\s]*)\{\{/g,'{{').replace(/\}\}([\s]*)/g,'}}');
    
    //remove all spaces, comments and pagebreaks and escape ' character
    if(t.match(/\{\{([\s\S]+?(\}?)+) \}\}/g))
    {
        //clean-up all bewteen }} and {{
        t+='{{ }}';
        t=t.replace(/([\s\S]+?)\{\{/ , function(match,txt){
            var m=match;
            m=escape(m);
            //return m.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/\s+/g," ").replace(/\> \</g,"><").replace(/<!--[\s\S]*?-->/g,'');
            return m.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/\s+/g," ").replace(/\> \</g,"><").replace(/<!--(?!\[if)(.|\s)*?-->/g,'');
        });
        t=t.replace(/\}\}([\s\S]+?)\{\{/g , function(match,txt){
            var m=match;
            m=escape(m);
            //return m.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/\s+/g," ").replace(/\> \</g,"><").replace(/<!--[\s\S]*?-->/g,'');
            return m.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/\s+/g," ").replace(/\> \</g,"><").replace(/<!--(?!\[if)(.|\s)*?-->/g,'');
        });
        t=t.substr(0,t.length-5);
    }else
    {
        //clean-up from content which not contain markup {{ ... }}
        t=escape(t);
        //t=t.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/\s+/g," ").replace(/\> \</g,"><").replace(/<!--[\s\S]*?-->/g,'');
        t=t.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/\s+/g," ").replace(/\> \</g,"><").replace(/<!--(?!\[if)(.|\s)*?-->/g,'');
        
    }
    
    //handle include partials
    t=t.replace(/\{\{inc ([\s\S]+?(\}?)+) \}\}/g , function(match,incfile){
        if(allTemplates.indexOf(incfile)>=0)
        {
            return "'+"+incfile.replace(/.html/,'')+"(data)+'";
        }else
        {
            console.log('warning: '+templateName+' includes none existing template '+incfile);
            return match;
        }
    });
    
    //handle inline functions
    t=t.replace(/\{\{inline(\s)([\s\S]+?(\}?)+) \}\}/g , function(match,x,fn){
        fn=fn.replace(/\n\s+/g,'\n');
        return "';\n"+fn+"\nret+='";
    });
    
    //handle self-defining functions
    t=t.replace(/\{\{fn ([\s\S]+?(\}?)+) \}\}/g , function(match,fn){
        var l=userfn.length;
        userfn[l]='function '+fname+'_'+l+'(data){'+fn+'}';
        return "'+"+fname+'_'+l+"(data)+'";
    });
    
    //handle data.[object]
    t=t.replace(/\{\{ (data\.[\s\S]+?(\}?)+) \}\}/g , function(match,data){ 
         return "'+"+data+"+'";
    });
    
    //handle data.[object] and encode
    t=t.replace(/\{\{ (#data\.[\s\S]+?(\}?)+) \}\}/g , function(match,data){ 
         return "'+encode("+data.slice(1)+")+'";
    });
    
    //add self-defining functions
    var js='';
    for(var x2=0,x_max2=userfn.length;x2<x_max2;x2++)
    {
        js+=userfn[x2]+"\n";
    }
    
    //handle layout template body content
    if(isLayout)
    {
        t=t.replace(/\{\{ body \}\}/g , "'+body+'");
        js+='function '+fname+'(data,body){';
    }else
    {
        js+='function '+fname+'(data){';
    }
    
    js+="\n";
    js+="var ret= '"+t+"';\n";
    js+="return ret;\n";
    js+='}\n';
    js+='module.exports.'+fname+'='+fname+';\n';
    
    return js;
}

/*
 * @param {String} filename
 * @param {Object} options
 * @param {Function} callback
 */
function __express(filename, options, callback) {
    callback = (typeof callback === 'function') ? callback : function () {};
    
    options = (typeof options === 'object') ? options : {layout:'layout',data:{}};
    if(typeof options.layout ==='undefined') options.layout='layout';
    
    var sp=filename.split('/');
    var countryCode=sp[sp.length-3];
    var languageCode=sp[sp.length-2];
    var template=sp[sp.length-1].replace(/.html/,'');
    var js='';
    for(var x=0,x_max=sp.length-1;x<x_max;x++)
    {
        js+=sp[x]+'/';
    }
    js+='compiled.js';
    var content='';
    
    try{
        var compiled=require(js);    
        if(options.layout!='')
        {
            content = compiled[options.layout](options.data ,compiled[template](options.data));
        }else
        {
            content = compiled[template](options.data);
        }    
        return callback(null,content);
    }catch(err)
    {
        return callback(err,content);
    }
    
}

function html2js()
{
    
}

module.exports.html2js=html2js;
module.exports.generate=generate;
module.exports.__express=__express;
module.exports.createTranslationTemplates=createTranslationTemplates;