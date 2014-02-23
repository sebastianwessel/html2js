var fs = require('fs');

var options={
    templateDir:'./templates',
    localsDir:'./locals',
    outputDir:'./views'
};

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
            
            for(x=0,x_max=localsfiles.length;x<x_max;x++)
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
                    for(y=0,y_max=templatefiles.length;y<y_max;y++)
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
                        //console.log( t );
                        js+=t+'\n';
                    }
                    
                    js+='var translate='+localsContent+';\n';
                    js+='module.exports.translate=translate;\n';
                    
                    output=outputDir+'/'+countryCode+'/'+languageCode+'/compiled.js';
                    fs.writeFileSync(output,js,{encoding:'utf8'});
                    
                }
                
            }
            
        });
        
    });
    

    return callback(null);
}



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


function translateTemplate(input,output,translate)
{

    data=fs.readFileSync(input,'utf8')
    var d=data;
    d=data.replace(/\{\{ (translate\.[\s\S]+?(\}?)+) \}\}/g , function(match,trans){ 
        //var i=trans.replace(/translate\./,'translation.');
        var v = eval(trans);
        if(typeof v!='undefined')
        {
            return v;
        }else
        {
            console.log('warning: '+trans+' '+(typeof v)+' for '+translate.currentCountryCode+'-'+translate.currentLanguageCode+' but used in template '+input);
            return match;
        }

    });
    fs.writeFileSync(output,d,{encoding:'utf8'});
 
}


function generateJS(countryCode,languageCode,templateName,allTemplates,templateContent)
{
    var t=templateContent;
    //var fname=templateName.replace(/.html/,'')+'_'+countryCode+'_'+languageCode;
    var fname=templateName.replace(/.html/,'');
    var userfn=[];
    
    t=t.replace(/\{\{inc ([\s\S]+?(\}?)+) \}\}/g , function(match,incfile){
        if(allTemplates.indexOf(incfile)>=0)
        {
            //return "'+"+incfile.replace(/.html/,'')+'_'+countryCode+'_'+languageCode+"(data,translate)+'";
            return "'+"+incfile.replace(/.html/,'')+"(data)+'";
        }else
        {
            console.log('warning: '+templateName+' includes none existing template '+incfile);
            return match;
        }
    });
    
    t=t.replace(/\{\{fn ([\s\S]+?(\}?)+) \}\}/g , function(match,fn){
        //return "'+function(){"+fn+"}+'";
        var l=userfn.length;
        userfn[l]='function '+fname+'_'+l+'(data){'+fn+'}';
        return "'+"+fname+'_'+l+"(data)+'";
    });
    
    t=t.replace(/\{\{ (data\.[\s\S]+?(\}?)+) \}\}/g , function(match,data){ 
         return "'+"+data+"+'";
    });
    
    t=t.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/\s+/g," ").replace(/\> \</g,"><").replace(/<!--[\s\S]*?-->/g,'');

    var js='';
    
     for(x2=0,x_max2=userfn.length;x2<x_max2;x2++)
    {
        js+=userfn[x2]+"\n";
    }
    js+='function '+fname+'(data){';
    
    //js+='\nvar countryCode="'+countryCode+'";\nvar languageCode="'+languageCode+'";\n';
    js+="\n";
    js+="return '"+t+"';\n";
    js+='}\n';
    js+='module.exports.'+fname+'='+fname+';\n';
    
    
    
    return js;
}

function __express(filename, options, callback) {
    callback = (typeof callback === 'function') ? callback : function () {};
    
    var sp=filename.split('/');
    var countryCode=sp[sp.length-3];
    var languageCode=sp[sp.length-2];
    var template=sp[sp.length-1].replace(/.html/,'');
    var js='';
    for(x=0,x_max=sp.length-1;x<x_max;x++)
    {
        js+=sp[x]+'/';
    }
    js+='compiled.js';
    var compiled=require(js);
    content = compiled[template](options.data);
    return callback(null,content);
}


module.exports.__express=__express;
module.exports.createTranslationTemplates=createTranslationTemplates;