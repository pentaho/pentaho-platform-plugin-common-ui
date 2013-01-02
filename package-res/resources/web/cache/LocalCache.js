pentaho = typeof pentaho == "undefined" ? {} : pentaho;
pentaho.common = pentaho.common || {};

dojo.require("dojox.storage");

pentaho.common.localcache = {
  keyRegex : new RegExp("[-\\.]", "gi"),
  cacheHasBeenRefreshed : false,
  lmMap: {},

  isAvailable : function() {
    if(dojox.storage.isAvailable()) {
      if (dojox.storage.manager.getProvider().declaredClass == "dojox.storage.FlashStorageProvider") {
        var installer = new dojox.flash.Install();
        var available = !installer.needed();
        return available;
      } else {
        return true;
      }
    }
    return false;
  },

  /**
   * Local storage providers don't support certain characters in key names.
   * This method will strip out any unsupportted characters and make a friendly key by swapping in an underscore.
   * @param key desired key name
   */
  getCacheKey : function(key) {
    return key.replace( this.keyRegex, "_" );
  },

  putValue : function(key, value, lastModified) {
    if(this.isAvailable()) {
      this.refreshCacheExirations();
      key = this.getCacheKey(key);
      var cacheLastModified = this.getLastModified(key);
      if(typeof(lastModified) == 'undefined') {
        lastModified = this.lmMap[key];
      }
      if(cacheLastModified == null) {
        var cachedObj = {
          lastModified: (typeof(lastModified) == 'undefined' ? 0 : lastModified),
          value: value
        }
      } else {
        var cachedObj = {
          lastModified: (typeof(lastModified) == 'undefined' ? cacheLastModified : lastModified),
          value: value
        }
      }
      dojox.storage.put(key, cachedObj);
    }
  },

  getValue : function(key) {
    if(this.isAvailable()) {
      this.refreshCacheExirations();
      key = this.getCacheKey(key);
      var cachedObj = dojox.storage.get(key);
      if(cachedObj != null) {
        return cachedObj.value;
      }
    }
    return null;
  },

  getLastModified : function(key) {
    // lookup the last modified value from the local storage cache
    if(this.isAvailable()) {
      this.refreshCacheExirations();
      key = this.getCacheKey(key);
      var cachedObj = dojox.storage.get(key);
      if(cachedObj != null) {
        var lastMod = cachedObj.lastModified;
        return lastMod;
      } else {
        return null;
      }
    }

  },

  setLastModified : function(key, lastModified) {
    if(this.isAvailable()) {
      key = this.getCacheKey(key);
      var cachedObj = dojox.storage.get(key);
      if(cachedObj != null) {
        cachedObj.lastModified = lastModified;
      } else {
        cachedObj = {
          lastModified: lastModified,
          value: null
        }
      }
      dojox.storage.put(key, cachedObj);
    }
  },

  clear : function(key) {
    if(this.isAvailable()) {
      key = this.getCacheKey(key);
      dojox.storage.remove(key);
    }
  },

  updateCacheExpiration : function(response) {
    this.lmMap = {};
    var lm = this.lmMap;
    $(response)
      .find('cache-item')
      .each(function() {
        var key = $(this).find('key').text();
        key = pentaho.common.localcache.getCacheKey(key);
        var lastModified = $(this).find('last-modified').text();

        lm[key] = lastModified;

        //console.log(key + ' --> ' + lastModified);
        var cachedObj = pentaho.common.localcache.getValue(key);
        if(cachedObj != null && pentaho.common.localcache.getLastModified(key) < lastModified) {
          pentaho.common.localcache.clear(key);
          pentaho.common.localcache.setLastModified(key, lastModified);
        }
      });
  },

//  getCacheExpirations : function() {
//    try {
//      if(pentahoGet) {
//        var result = pentahoGet(CONTEXT_PATH + "CacheExpirationService", "", this.updateCacheExpiration);
//      }
//    } catch (e) {
//      // can't use pentahoGet...
//    }
//  },

  refreshCacheExirations : function() {
    if(this.cacheHasBeenRefreshed == false) {
      if(window.pentahoCacheExpirationServiceResults != 'undefined' && window.pentahoCacheExpirationServiceResults != null) {
        this.cacheHasBeenRefreshed = true;
        this.updateCacheExpiration(window.pentahoCacheExpirationServiceResults);
      }
    }
  }
}

