dojo.provide("pentaho.common.Messages");

/**
 * Add a resource bundle to the set of resource bundles.
 * 
 * @param packageName String the name of the package containing the javascript
 * file with the resource strings. 
 * @param fileName String name of the javascript file with the 
 * resource strings, without the extention.
 */
/*public static*/Messages.addUrlBundle = function( packageName, url )
{
    var xml = pentahoGet( url, '' );

    var pos1 = xml.indexOf('<return>');
    var pos2 = xml.indexOf('</return>');

    if( pos1 != -1 && pos2 != -1 ) {
        resultJson = xml.substr( pos1+8, pos2-pos1-8 )
    }
    var bundle = eval('('+resultJson+')');

    Messages.messageBundle.push( bundle );    
};

