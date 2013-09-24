  
var console_enabled = false;
  
function pentaho_client_onload() {

}

    function findUrlParam( name, url ) {
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

var gCtrlr = new WaqrProxy();

function WaqrProxy() {

    this.wiz = new Wiz();
    this.repositoryBrowserController = new RepositoryBrowserControllerProxy();
    
    this.savePg0 = function() {
    }
    
}

function Wiz() {
    this.currPgNum = 0;
    this.previewTypeSelect = {};
}


function RepositoryBrowserControllerProxy() {

    this.callbackObject = null;

    this.remoteSave = function( myFilename, mySolution, myPath, myType, myOverwrite ) {
    
        this.callbackObject.saveState(myFilename, mySolution, myPath, myType, myOverwrite);
    
    }
}

function parseXML(sText){
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
            alert(e.message);
            return false;
        }
    }
}
   
PentahoUserConsole = function() {

  this.console_enabled = window.parent != null && window.parent.mantle_initialized == true;
  
  this.toggleEditCallback = null;

  this.enableEditButton = function() {
    // if possible, enable the 'Edit' toolbar button
    if( this.console_enabled && window.parent.enableContentEdit ){
        window.parent.enableContentEdit( true );
    }

  }

  this.disableEditButton = function() {
    // if possible, disable the 'Edit' toolbar button
    if( this.console_enabled && window.parent.enableContentEdit ){
        window.parent.enableContentEdit( false );
    }
  }

  this.lowerEditButton = function() {
    // if possible, lower/depress the 'Edit' toolbar button
    if( this.console_enabled && window.parent.setContentEditSelected ){
        window.parent.setContentEditSelected( true );
    }
  }

  this.resetEditButton = function() {
    // if possible, raise/reset the 'Edit' toolbar button
    if( this.console_enabled && window.parent.setContentEditSelected ){
        window.parent.setContentEditSelected( false );
    }
  }

this.enableSaveButtons = function() {
    // if possible, enable the 'Save' and 'Save As' toolbar buttons
    if( this.console_enabled && window.parent.enableSave ) {
        window.parent.enableSave( true );
    }
}

this.disableSaveButtons = function() {
    // if possible, disable the 'Save' and 'Save As' toolbar buttons
    if( this.console_enabled && window.parent.enableSave ) {
        window.parent.enableSave( false );
    }
}

this.refreshBrowsePanel = function() {
    // if possible refresh the solution browser panel
    if ( this.console_enabled && window.parent.mantle_refreshRepository ) {
        window.parent.mantle_refreshRepository();
    }
}

this.collapseBrowsePanel = function() {
	if( this.console_enabled){
        window.parent.executeCommand("CollapseBrowserCommand");
	}
}

this.showBrowsePanel = function() {
  if( this.console_enabled){
        window.parent.executeCommand("ShowBrowserCommand");
  }
}

this.refreshBrowsePerspective = function() {
  if(this.console_enabled && window.top.mantle_fireEvent){
    window.top.mantle_fireEvent('GenericEvent', {"eventSubType": "RefreshBrowsePerspectiveEvent"});
  }
}

this.refreshCurrentFolder = function() {
  if(this.console_enabled && window.top.mantle_fireEvent){
    window.top.mantle_fireEvent('GenericEvent', {"eventSubType": "RefreshCurrentFolderEvent"});
  }
}
  
}

