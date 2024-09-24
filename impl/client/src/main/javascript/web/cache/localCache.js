/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
define([
  "dojox/storage",
  "../jquery"
], function(storage, $) {

  // Not totally AMD.
  storage = dojox.storage;

  var keyRegex = new RegExp("[-\\.]", "gi"),
      lmMap = {},
      cacheHasBeenRefreshed = false;

  return {
    isAvailable: function() {
     if(storage.isAvailable()) {
       if(storage.manager.getProvider().declaredClass == "dojox.storage.FlashStorageProvider") {
         var installer = new dojox.flash.Install();
         return !installer.needed();
       }

       return true;
     }

     return false;
    },

    /**
     * Local storage providers don't support certain characters in key names.
     * This method will strip out any unsupportted characters and make a friendly key by swapping in an underscore.
     * @param key desired key name
     */
    getCacheKey: function(key) {
      return key.replace(keyRegex, "_");
    },

    putValue: function(key, value, lastModified) {
      if(this.isAvailable()) {
        this.refreshCacheExpirations();
        key = this.getCacheKey(key);

        var cacheLastModified = this.getLastModified(key),
            cachedObj;

        if(lastModified == null) lastModified = lmMap[key];

        if(cacheLastModified == null) {
          cachedObj = {
            lastModified: (lastModified == null ? 0 : lastModified),
            value:        value
          };
        } else {
          cachedObj = {
            lastModified: (lastModified == null ? cacheLastModified : lastModified),
            value:        value
          };
        }

        storage.put(key, cachedObj);
      }
    },

    getValue: function(key) {
      if(this.isAvailable()) {
        this.refreshCacheExpirations();
        key = this.getCacheKey(key);
        var cachedObj = storage.get(key);
        if(cachedObj != null) {
          return cachedObj.value;
        }
      }
      return null;
    },

    getLastModified: function(key) {
      // lookup the last modified value from the local storage cache
      if(this.isAvailable()) {
        this.refreshCacheExpirations();
        key = this.getCacheKey(key);
        var cachedObj = storage.get(key);
        if(cachedObj != null) {
          var lastMod = cachedObj.lastModified;
          return lastMod;
        }
        return null;
      }
    },

    setLastModified: function(key, lastModified) {
      if(this.isAvailable()) {
        key = this.getCacheKey(key);
        var cachedObj = storage.get(key);
        if(cachedObj) {
          cachedObj.lastModified = lastModified;
        } else {
          cachedObj = {
            lastModified: lastModified,
            value: null
          };
        }
        storage.put(key, cachedObj);
      }
    },

    clear: function(key) {
      if(this.isAvailable()) {
        key = this.getCacheKey(key);
        storage.remove(key);
      }
    },

    updateCacheExpiration: function(response) {
      lmMap = {};
      var me = this;
      $(response)
        .find('cache-item')
        .each(function() {
          var key = $(this).find('key').text();
          key = me.getCacheKey(key);

          var lastModified = $(this).find('last-modified').text();

          lmMap[key] = lastModified;

          //console.log(key + ' --> ' + lastModified);
          var cachedObj = me.getValue(key);
          if(cachedObj != null && me.getLastModified(key) < lastModified) {
            me.clear(key);
            me.setLastModified(key, lastModified);
          }
        });
    },

  //  getCacheExpirations: function() {
  //    try {
  //      if(pentahoGet) {
  //        var result = pentahoGet(CONTEXT_PATH + "CacheExpirationService", "", this.updateCacheExpiration);
  //      }
  //    } catch (e) {
  //      // can't use pentahoGet...
  //    }
  //  },

    refreshCacheExpirations: function() {
      if(!cacheHasBeenRefreshed) {
        var results = window.pentahoCacheExpirationServiceResults;
        if(results != 'undefined' && results != null) {
          // cacheHasBeenRefreshed is never reset?
          cacheHasBeenRefreshed = true;
          this.updateCacheExpiration(results);
        }
      }
    }
  };
});
