dojo.provide("pentaho.common.Messages");
dojo.declare("pentaho.common.Messages", null, {});

/*private static*/pentaho.common.Messages.init = function()
{
  if (pentaho.common.Messages.messageBundle === undefined) {
    pentaho.common.Messages.messageBundle = {};
  }
};

/**
 * Add a resource bundle to the set of resource bundles.
 *
 * @param packageName String the name of the package containing the javascript
 * file with the resource strings.
 * @param fileName String name of the javascript file with the
 * resource strings, without the extention.
 */
/*public static*/pentaho.common.Messages.addBundle = function( packageName, fileName )
{
  // Make sure Dojo doesn't try to load message bundles from any other locales than the default (ROOT).
  // Without the locale override Dojo will attempt to load resources from: ROOT, language, locale (language + variant).
  //     e.g. For English in the US: ROOT, en, en-us
  //          This results in 404s for any message bundle that does not exist as the client has no way of knowing.
  // We should change this to URL bundles exclusively or run a dojo build for all javascript (dataapi, common, etc)

  // Using ambiguated form to defeat dojo parser
  dojo["requireLocalization"](packageName, fileName, "ROOT", "ROOT");
  pentaho.common.Messages.messageBundle[packageName] = dojo.i18n.getLocalization(packageName, fileName);
};

/**
 * Finds and returns a registered bundle if it exists.
 *
 * @param {String} name Name of a registered bundle
 * @return {Object} Message bundle as an object of key-value pairs or undefined if not found.
 */
/*public static*/pentaho.common.Messages.getBundle = function (name) {
  return pentaho.common.Messages.messageBundle[name];
}

/*private static*/
pentaho.common.Messages.entityDecoder=document.createElement('textarea');

/**
 * Get the string from a message bundle referenced by <param>key</param>.
 * @param key String the key in the bundle which references the desired string
 * @param substitutionVars Array of String (optional) an array of strings
 * to substitute into the message string.
 * @return String the string in the message bundle referenced by <param>key</param>.
 */
/*public static*/pentaho.common.Messages.getString = function( key, substitutionVars )
{
  var b, bundle,
      msg = key; // if we don't find the msg, return the key as the msg
  // loop through each message bundle
  for (b in pentaho.common.Messages.messageBundle) {
    if (pentaho.common.Messages.messageBundle.hasOwnProperty(b)) {
      bundle = pentaho.common.Messages.messageBundle[b];
      // does this bundle have the key we are looking for?
      if (bundle.hasOwnProperty(key)) {
        // yes, it has the key
        msg = bundle[key];
        if ( undefined != substitutionVars )
        {
          var subs = {};
          if(dojo.isString(substitutionVars)) {
            subs['0'] = substitutionVars;
          }
          else if(dojo.isArray(substitutionVars)) {
            for(var sNo=0; sNo<substitutionVars.length; sNo++) {
              subs[''+sNo] = substitutionVars[sNo];
            }
          }
          else if(dojo.isObject(substitutionVars)) {
            subs = substitutionVars;
          }
          if(dojo.string.substituteParams) {
            msg = dojo.string.substituteParams(msg, subs);
          }
          else if(dojo.replace) {
            msg = dojo.replace(msg, subs);
          }
        }
        break;
      }
    }
  }
  return msg;
};
var cnt = 0;

/**
 * TODO sbarkdull: this method does not belong here, it belongs in UIUtils
 *
 * @param elementOrId String or HTML element, if String, must be the id of an HTML element
 * @param msgKey String key into the message map
 */
/*public static*/pentaho.common.Messages.setElementText = function( elementOrId, msgKey )
{
  var element;
  if (typeof elementOrId == "string") {
    element = document.getElementById(elementOrId);
  } else {
    element = elementOrId;
  }
  if (element) {
    element.innerHTML = pentaho.common.Messages.getString(msgKey);
  }
};

/**
 * Add a resource bundle to the set of resource bundles.
 *
 * @param packageName String the name of the package containing the javascript
 * file with the resource strings.
 * @param fileName String name of the javascript file with the
 * resource strings, without the extention.
 * @param reload Force the reloading of this package name? If the package name
 * has already been provided no request will be made to the url. Defaults to false.
 */
/*public static*/pentaho.common.Messages.addUrlBundle = function( packageName, url, reload )
{
  if (!reload && pentaho.common.Messages.messageBundle.hasOwnProperty(packageName)) {
    return;
  }

  var deferred = dojo.xhrGet(
      {
        url: url,
        handleAs: "json",
        // This call must be synchronous so we inject the require message bundle before it needs to be used.  Message bundles
        // are generally fetched immediately before attempting to look up a localized string.
        sync: true
      }
  );

  deferred.then(
      function(data){
        pentaho.common.Messages.messageBundle[packageName] = data;
      },

      function(error){
        if(typeof(console) != "undefined"){
          console.log("error loading message bundle at:"+url);
        }
      }
  );

};

/* static init */
pentaho.common.Messages.init();
pentaho.common.Messages.addUrlBundle('pentaho.common',CONTEXT_PATH+'i18n?plugin=common-ui&name=resources/web/dojo/pentaho/common/nls/messages');