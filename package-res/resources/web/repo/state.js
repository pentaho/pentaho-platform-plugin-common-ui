
function PentahoRepositoryClient() {

    this.SERVICE_URL = CONTEXT_PATH + 'content/ws-run/RepositoryClientService';

    this.fileType = null;

    this.getStateAsXmlCallback = null;

    this.getStateAsJsonCallback = null;
 
    this.shouldLoad = function () {
    // see if we have any parameters on the URL that tell us to load state from the server
    var url = document.location.href;

    if( url.indexOf( '?' ) != -1 ) {
      // we have parameters
        var command = this.findUrlParam( 'command', url );
        var doLoad = command == 'edit' || command=='load';
        return doLoad;
    }
    return false;
}

this.shouldEdit = function () {
    // see if we have any parameters on the URL that tell us to load state from the server
    var url = document.location.href;

    if( url.indexOf( '?' ) != -1 ) {
      // we have parameters
        var command = this.findUrlParam( 'command', url );
        var doLoad = command == 'edit' || command=='new';
        return doLoad;
    }
    return false;
}

this.findUrlParam = function( name, url ) {
      var pos = url.indexOf( '?' );
      var params = url.substr( pos );
      pos = params.indexOf( '?'+name+'=' );
      if( pos == -1 ) {
        pos = params.indexOf( '&'+name+'=' );
      }
      if( pos != -1 ) {
        var tmp = params.substr( pos + name.length + 2 );
        if( tmp.indexOf( '&' ) != -1 ) {
          tmp = tmp.substr( 0, tmp.indexOf( '&' ) );
        }
        tmp = unescape( tmp );
        return tmp;
      }
      return null;
    }

this.loadStateStringFromUrl = function() {

    // TODO - handle reposvc URLs
    var url = document.location.href;
    var solution = this.findUrlParam( 'solution', url );
    var path = this.findUrlParam( 'path', url );
    var filename = this.findUrlParam( 'filename', url );
    return this.loadStateString( solution, path, filename );
}

this.loadStateString = function( solution, path, filename ) {

    // handle '/'s robustly
    if( path.indexOf( '/' ) == 0 ) {
        // trim a leading '/'
        path = path.substr( 1 );
    }
    if( path[path.length-1] == '/' ) {
        path = path.substr( 0, path.length-2 );
    }
    var query = '';
    if( path != '' ) {
        query = 'filepath='+solution+'/'+path+'/'+filename;
    } else {
        query = 'filepath='+solution+'/'+filename;
    }
    var resultStr = pentahoGet( this.SERVICE_URL+'/loadState', query, null, 'text/text' );
    
    // pull the state, status, and message out
    if( !resultStr ) {
        return null;
    }
    var stateObject = this.getResultMessage(resultStr);
    return stateObject;
    
}

    this.getResultMessage = function( str ) {
        var xml  = this.parseXML(str);

        var stateObject = new StateObject();

        var nodeList = xml.getElementsByTagName('state');
        if( nodeList.length > 0 && nodeList[0].firstChild ) {
            stateObject.state = nodeList[0].firstChild.nodeValue;
        }
        
        nodeList = xml.getElementsByTagName('message');
        if( nodeList.length > 0 && nodeList[0].firstChild ) {
            stateObject.message = nodeList[0].firstChild.nodeValue;
        }

        nodeList = xml.getElementsByTagName('status');
        if( nodeList.length > 0 && nodeList[0].firstChild ) {
            stateObject.status = nodeList[0].firstChild.nodeValue;
        }
        
        return stateObject;

    }

this.parseXML = function(sText){
    if( !sText ) {
        return null;
    }
    var xmlDoc;
    try { //Firefox, Mozilla, Opera, etc.
        parser=new DOMParser();
        xmlDoc=parser.parseFromString(sText,"text/xml");
        return xmlDoc;
    } catch(e){
        try { //Internet Explorer
            xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async="false";
            xmlDoc.loadXML(sText);
            return xmlDoc;
        } catch(e) {
        }
    }
    alert('XML is invalid or no XML parser found');
    return null;
}

    this.saveState = function(myFilename, mySolution, myPath, myType, myOverwrite) {

        if( myFilename.indexOf( this.fileType ) != -1 && myFilename.indexOf( this.fileType ) == (myFilename.length - 6 )) {
            myFilename = myFilename.substr( 0, myFilename.length - this.fileType.length );
        }
        var isXml = false;
        var stateStr = null;

        
        if( pentahoRepositoryClient.getStateAsXmlCallback ) {
            // get the state from the page
            stateStr = pentahoRepositoryClient.getStateAsXmlCallback();
            isXml = true;
        }
        else if( pentahoRepositoryClient.getStateAsJsonCallback ) {
            // get the state from the page
            stateStr = pentahoRepositoryClient.getStateAsJsonCallback();
            isXml = false;
        }

        if( !stateStr ) {
            // we don't have any state to save
            alert('Cannot save, no state was provided');
        }

        var query = 'filepath=' + encodeURIComponent( '/'+mySolution+(myPath?'/':'')+myPath+'/'+myFilename )
            + '&state=' + encodeURIComponent( stateStr )
            + '&type=' + encodeURIComponent( this.fileType )
            + '&replace=' + myOverwrite
            
        // TODO get this working with POST instead of GET
        var result = pentahoGet( this.SERVICE_URL+'/'+((isXml)?'saveStateXml':'saveStateString'), query, null, 'text/text' );
        var stateObject = this.getResultMessage(result);
        
        alert(stateObject.message);
        
        if( stateObject.status == 'SUCCESS' ) {
        
            var userConsole = new PentahoUserConsole();
            if ( userConsole.console_enabled && window.parent.mantle_refreshRepository ) {
                window.parent.mantle_refreshRepository();
            }
        }
        
        return stateObject;
        
    }

    try {
        if( gCtrlr && gCtrlr.repositoryBrowserController) {
            gCtrlr.repositoryBrowserController.callbackObject = this;
        }
    } catch (e) {}


}

function saveState( myFilename, mySolution, myPath, myType, myOverwrite ) {

    pentahoRepository.saveState( myFilename, mySolution, myPath, myType, myOverwrite );

}

function StateObject() {
    this.status = null;
    this.state = null;
    this.message = null;
}

var pentahoRepositoryClient = new PentahoRepositoryClient();

pentaho = typeof pentaho == "undefined" ? {} : pentaho;

/*
This is an API that lets clients get and set user settings
*/
pentaho.userSettings = function() {
}

pentaho.userSettings.prototype.generateUniqueUrl = function(url) {
  // Prevent caching for IE
  // Remove once BISERVER-6216 is implemented
  var time = new Date().getTime();
  return url + (url.indexOf('?') !== -1 ? "&" : "?") + time + "=" + time;
}

/*
  Returns an array of settings objects when passed a comma separated list of setting names
*/
pentaho.userSettings.prototype.getSettings = function( names, callback, caller ) {

  dojo.xhrGet({
    url: this.generateUniqueUrl(CONTEXT_PATH + 'content/ws-run/UserSettingService/getUserSettingsJson'),
    content: {
        settingNames : names
    },
    load: dojo.hitch(caller, function(data) { callback(controller.getJsonFromXml(data)); }),
    error: function(data) {alert(data)}
  });
}

/*
  Sets a user setting.  
*/
pentaho.userSettings.prototype.setSetting = function( name, value, callback, caller ) {

  dojo.xhrGet({
    url: this.generateUniqueUrl(CONTEXT_PATH + 'content/ws-run/UserSettingService/setUserSettingJson'),
    content: {
        settingName : name,
        settingValue : value
    },
    load: dojo.hitch(caller, function(data) {
      callback(controller.getJsonFromXml(data));
    }),
    error: function(data) {alert(data)}
  });
}

pentaho.userSettingsInstance = new pentaho.userSettings();
