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
var logger=require('./logger.js').log;
var objectMerge=require('object-merge');

var options={
    templateDir:'./templates',
    localsDir:'./locals',
    outputDir:'./views'
};

var allTemplates=[];

/*
 * Generates multiple templates which are stored in subfolders.
 * Folder structure will be:
 * inputDir/template1/html (where html templates are stored)
 * inputDir/template1/locals (where translations are stored in subfolders)
 * 
 * inputDir/template2/html (where html templates are stored)
 * inputDir/template2/locals (where translations are stored in subfolders)
 * 
 * @param {String} inputDir where templtes are stored
 * @param {String} outputDir where generated files are stored
 * @param {Function} callback function which is called after generation
 */
function generateMulti(inputDir,outputDir,callback){
    callback = (typeof callback === 'function') ? callback : function () {};
    var stat=null;
    var err2=null;
    var validTemplates=[];
    try
    {
        stat=fs.statSync(outputDir);
        if(!stat.isDirectory()) {
            logger.logError(outputDir+' is no directory!');
            return callback(new Error(outputDir+' is no directory!'));
        } 
    }catch(err)
    {
        logger.logError('unable to access output directory '+outputDir);
        return callback(err);
    }
    
    try
    {
        var templateDir=fs.readdirSync(inputDir);
        templateDir.forEach(function(f){
            stat=fs.statSync(inputDir+'/'+f);
            if (stat && stat.isDirectory()) {
                logger.logInfo('template directory '+f);
                
                try{
                    stat=fs.statSync(outputDir+'/'+f);
                    if(!stat || !stat.isDirectory())
                    {
                        logger.logError(outputDir+'/'+f+' is not a directory');
                        return new Error(outputDir+'/'+f+' is not a directory');
                    }

                }catch(err3)
                {
                    try
                    {
                        fs.mkdirSync(outputDir+'/'+f);
                        logger.logDebug('created outputDir for '+f);
                    }catch(err4){
                        logger.logError('unable to create output directory '+f);
                        return err4;
                    }

                }
                
                err2=generate(inputDir+'/'+f,outputDir+'/'+f,f);
                if(err2)
                {
                    logger.logError('error in template f: '+err2.toString());
                }else
                {
                    validTemplates.push(f);
                }
            };
        });
        
        
        var js='',l=validTemplates.length;
        js+='var name=\'\';\n';
        js+='var validTemplates={';

        validTemplates.forEach(function(n){
            js+='\n\t\''+n+'\':require(\'./'+n+'/template_info.js\')';
            l--;
            if(l>0) js+=',';
        });
        js+='\n};\n';
        js+='module.exports.validTemplates=validTemplates;\n';
        js+='module.exports.name=name;\n';
        js+='module.exports.single=false;\n';

        fs.writeFileSync(outputDir+'/template_info.js',js,{encoding:'utf8'});
        
        
        return callback();
    }catch(err)
    {
        logger.logError('unable to access template directory '+inputDir);
        return callback(err);
    }    
}

/*
 * Generates single template
 *  
 * @param {String} inputDir
 * @param {String} outputDir
 * @param {String} null or template name
 * @returns {Error|err|unresolved|err2}
 */
function generate(inputDir,outputDir,f) {
    f = (typeof f === 'string') ? f : 'template';
    var stat=null;
    try
    {
        stat=fs.statSync(inputDir+'/html');
        if (!stat.isDirectory()) {
            return new Error(f+'/html is not a folder');
        }
        logger.logInfo('found html directory for '+f);
        try
        {
            stat=fs.statSync(inputDir+'/locals');
            if (!stat.isDirectory()) {
                return new Error(f+'/locals is not a folder');
            }
            logger.logInfo('found locals directory for '+f);
            
            
            var err5=generateTemplate(f,inputDir,outputDir);
            if(err5) return err5;
            
        }catch(err2)
        {
            logger.logError('no locals folder found for '+f);
            return err2;
        }
          
    }catch(err){
        logger.logError('no html folder found for '+f);
        return err;
    }
 
}

/*
 * Generates outputfolders and each (country-)language combination for given template
 * 
 * @param {String} templateName
 * @param {String} inputDir (template folder)
 * @param {String} outputDir 
 * @returns {Error} returns error object or null
 */
function generateTemplate(f,inputDir,outputDir) {
    logger.logDebug('start generating template '+f);
    var htmls=[];
    var err=null;
    var stat=null;
    var defaultTranslations={};
    var currentTranslation=null;
    var currentCountryCode='',currentLanguageCode='';
    var c=[];
    var validLanguages=[];
    
    htmls=fs.readdirSync(inputDir+'/locals');

    htmls.sort(function(a,b){
        var ret=0;
        if(a.length>b.length) ret=1;
        if(a.length<b.length) ret=-1;
        return ret; 
    });

    
    htmls.forEach(function(localsDir){
        stat=fs.statSync(inputDir+'/locals/'+localsDir);
        if (stat && stat.isDirectory()) {
            logger.logInfo('found translation '+localsDir+' for '+f);
            
            try{
                stat=fs.statSync(outputDir+'/'+localsDir);
                if (!stat || !stat.isDirectory()) {
                    logger.logError('output directory '+localsDir+' for '+f+' is not a directory');
                    return new Error('output directory '+localsDir+' for '+f+' is not a directory');
                }
            }catch(err){
                try{
                    fs.mkdirSync(outputDir+'/'+localsDir);
                    logger.logDebug('created output directory '+localsDir+' for '+f);
                }catch(err2){
                    
                    logger.logError('unable to create output directory '+localsDir+' for '+f);
                    return err2;
                }
            }
            
            c=localsDir.split('-');
            if(c.length>1){
                currentCountryCode=c[0];
                currentLanguageCode=c[1];
            }else
            {
                currentCountryCode='';
                currentLanguageCode=localsDir;
            }
            
            if(defaultTranslations[currentLanguageCode]){
                currentTranslation=defaultTranslations[currentLanguageCode];
                currentTranslation.currentCountryCode=currentCountryCode;
                currentTranslation.currentLanguageCode=currentLanguageCode;
            }else
            {
                currentTranslation={'currentLanguageCode':currentLanguageCode,'currentCountryCode':currentCountryCode};
            }
            
            err=generateTranslation(f,inputDir,outputDir,localsDir,currentTranslation);
            if(err && err instanceof Error){
                logger.logError(err);
                return err;
            }
            if(err){
                defaultTranslations[localsDir]=err;
            }
            validLanguages.push(localsDir);
            
        }
    });
    
    var js='',l=validLanguages.length;
    js+='var name=\''+f+'\';\n';
    js+='var validLanguages={';
    
    validLanguages.forEach(function(n){
        js+='\n\t\''+n+'\':require(\'./'+n+'/compiled.js\')';
        l--;
        if(l>0) js+=',';
    });
    js+='\n};\n';
    js+='module.exports.validLanguages=validLanguages;\n';
    js+='module.exports.name=name;\n';
    js+='module.exports.single=true;\n';
    
    fs.writeFileSync(outputDir+'/template_info.js',js,{encoding:'utf8'});
    
    return null;
}

/*
 * generates single translation for given (country-)language combination
 * generates compiled.js file for given (country-)language combination
 * 
 * @param {String} template name
 * @param {String} inputDir
 * @param {String} outputDir
 * @param {String} localsDir
 * @param {Object} default Translation
 * @returns {Error| translation Object}
 */
function generateTranslation(f,inputDir,outputDir,localsDir,defaultTranslation){
    var translations=[];
    var err=null;
    var stat=null;
    var localsContent=null;
    var item=null;
    var templates=[];
    
    var translation={};
    
    translations=fs.readdirSync(inputDir+'/locals/'+localsDir);
    
    try{
        localsContent=fs.readFileSync(inputDir+'/locals/'+localsDir+'/_default.json');
        try{
            translation=JSON.parse(localsContent);
            logger.logDebug('setting defaults from _default.json in '+localsDir+' for '+f);
        }catch(e2){
            logger.logError('invalid json file _default.json for '+f+' in '+localsDir);
            return e2;
        }
    }catch(e){
        logger.logDebug('no _default.json in '+localsDir+' for '+f);
    }
    
    translations.forEach(function(file){
        if(file.match(/^([a-zA-Z0-9_]+)\.json/) && file!=='_default.json')
        {
            stat=fs.statSync(inputDir+'/locals/'+localsDir+'/'+file);
            if (stat && !stat.isDirectory()) {
                logger.logDebug('adding translation file '+file+' to '+localsDir+' for '+f);
                
                try {
                    localsContent=fs.readFileSync(inputDir+'/locals/'+localsDir+'/'+file);
                }catch(e)
                {
                    logger.logError('unable to read file '+file+' for '+f+' in '+localsDir);
                    return e;
                }
                
                try{
                    item=file.split('.');
                    translation[item[0]]=JSON.parse(localsContent);
                }catch(e)
                {
                    logger.logError('invalid json file '+file+' for '+f+' in '+localsDir);
                    return e;
                }
                

            }
        }else
        {
            if(file!=='_default.json') logger.logDebug('skipping '+file+' in '+localsDir+' for '+f);
        }        
    });
    
    var tmp=translation;
    if(defaultTranslation!==null){
        tmp=objectMerge(defaultTranslation,translation);
        logger.logDebug('merging language default translation with '+localsDir+' ');
    }
    
    templates=fs.readdirSync(inputDir+'/html/');
    templates.forEach(function(file){
        err=translateTemplate(inputDir+'/html/'+file,outputDir+'/'+localsDir+'/'+file,tmp);
        if(err) {
            logger.logError(err);
            return err;
        }
    });
    
    var js='',addjs='',output='',n='',t='';

        
    templates.forEach(function(file){      
        n=file.substr( file.lastIndexOf('.') );
        if(n==='.js')
        {
            addjs+=fs.readFileSync(inputDir+'/html/'+file,'utf8');
        }else if(n==='.html')
        {

            t=generateJS(
                file,
                templates,
                fs.readFileSync(outputDir+'/'+localsDir+'/'+file,'utf8')
                        );
            js+=t+'\n';
        }
    });

    //js+='var translate='+localsContent+';\n';
    js+='var translate='+JSON.stringify(translation)+';\n';
    js+='module.exports.translate=translate;\n';
    addjs+='\n'+fs.readFileSync(__dirname+'/fn_include.js','utf8');
    js+='\n'+addjs;


    output=outputDir+'/'+localsDir+'/compiled.js';
    fs.writeFileSync(output,js,{encoding:'utf8'});   
    return tmp;
}


/*
 * This function reads content of file input, replaces placeholders with translations from JSON-object translate and stores result to output file
 * @param {String} input
 * @param {String} output
 * @param {Object} translate
 * @return {null|Error}
 */
function translateTemplate(input,output,translate)
{
    var v=null;
    try
    {
        var data=fs.readFileSync(input,'utf8')
        var d=data;
        d=data.replace(/\{\{ (translate\.[\s\S]+?(\}?)+) \}\}/g , function(match,trans){ 
            try
            {
                v = eval(trans);
                if(typeof v!=='undefined' && v!==null)
                {
                    return v;
                }else
                {
                    logger.logWarning(trans+' '+(typeof v)+' not set in translation files but used in template '+input);
                    return match;
                }
            }catch(err)
            {
                logger.logWarning(trans+' '+(typeof v)+' not set in translation files but used in template '+input);
                return match;
            }
        });
        fs.writeFileSync(output,d,{encoding:'utf8'});
        return null;
    }catch(e)
    {
        logger.logError('error translating '+output);
        return e;
    }
}


function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

/*
 * 
 * @param {String} String to escape character '
 * @returns {String} escaped String
 */
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
 * This function takes translated html template content for one (country-)language-combinantion and creates js code.
 * Generated js code will be returned as String.
 * 
 * @param {String} countryCode
 * @param {String} languageCode
 * @param {String} templateName
 * @param {Array} allTemplates
 * @param {String} templateContent
 * @returns {String}
 */
function generateJS(templateName,allTemplates,templateContent)
{
    var t=templateContent;
    var fname=templateName.replace(/.html/,'');
    var userfn=[];
    var isLayout=strStartsWith(fname,'layout');
    
    //remove comments from javascript blocks
    t=t.replace(/<script[^<]*<\/script>/g ,function(match,txt){
        var m=match;
        m=m.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
        return m;
    });
    
    //remove space, tabs, pagebreaks before and after markup {{...}}
    t=t.replace(/([\s]*)\{\{/g,'{{').replace(/\}\}([\s]*)/g,'}}');
    
    //remove all spaces, HTML comments and pagebreaks and escape ' character
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
            logger.logWarning(templateName+' includes none existing template '+incfile);
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
    
    
    var sp=filename.split('/');
    var ctrlngCode=sp[sp.length-2];
    var ctrlngsplit=ctrlngCode.split('-');
    var lng=ctrlngsplit[ctrlngsplit.length-1];
    var template=sp[sp.length-1].replace(/.html/,'');
    
    if(options!==null)
    {
        options = (typeof options === 'object') ? options : {layout:'layout',data:{}};
        if(typeof options.layout ==='undefined') options.layout='layout';
    }else
    {
        options={layout:''};
    }
    
    var js='';
    for(var x=0,x_max=sp.length-2;x<x_max;x++)
    {
        js+=sp[x]+'/';
    }
    js+='template_info.js';
    var content=null,compiled=null;
    
    try{
        var tInfo=require(js);
        compiled=tInfo.validLanguages[ctrlngCode];
        if(!compiled){
            logger.logDebug('unable to find solution for '+ctrlngCode+' try to use only '+lng);
            if(ctrlngsplit.length>1){
                compiled=tInfo.validLanguages[lng];
                if(!compiled){
                    logger.logError('unable to find template_info.js for '+ctrlngCode+' or '+lng);
                    logger.logError(filename);
                    return callback(e);
                }
            }else
            {
                logger.logError('unable to find template_info.js for '+filename);
                return callback(e);
            }
        }
        if(options.layout!=='')
        {
            content = compiled[options.layout](options.data ,compiled[template](options.data));
        }else
        {
            content = compiled[template](options.data);
        }    
        return callback(null,content);
        
    }catch(e){
        logger.logError('unable to find template_info.js for '+filename);
        return callback(e);
    }
}

function html2js()
{
    
}

function setLogger(l) {
    logger=l;
}


module.exports.html2js=html2js;
module.exports.setLogger=setLogger;
module.exports.generateMulti=generateMulti;
module.exports.generate=generate;
module.exports.__express=__express;