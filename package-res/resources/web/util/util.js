/**
 * Utility methods designed for general use
 */
pen.define(function() {
  return {

  /**
     * Parse the parameters from the current URL.
     *
     * @return Map of decoded parameter names and values
     */
    getUrlParameters: function() {
      var urlParams = {};
      var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        reg = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        query = window.location.search.substring(1);

      while (e = reg.exec(query)) {
        var paramName = decode(e[1]);
        var paramVal = decode(e[2]);

        if (urlParams[paramName] !== undefined) {
          paramVal = $.isArray(urlParams[paramName])
            ? urlParams[paramName].concat([paramVal])
            : [urlParams[paramName], paramVal];
        }
        urlParams[paramName] = paramVal;
      }
      return urlParams;
    },

    /**
     * Parses the language portion of a locale URL parameter, if defined.
     *
     * @return language portion of the URL parameter "locale". If it is not defined, undefined is returned.
     */
    getLocale: function() {
      var locale = this.getUrlParameters().locale;
      if (locale && locale.length > 2) {
        locale = locale.substring(0, 2);
      }
      return locale;
    },


    /**
     * Used by localizeDom, not intended for direct calling
     * @param key
     * @param text
     */
    localizeDomCtrl: function(key, text, idPrefix) {

      var prop = null;
      var e = null;
      var id = null;
      var prefix = idPrefix || "";

      if(key.indexOf('_label') == key.length-6 ) {
        id = key.substr(0, key.length-6);
        prop = 'label';
      } else if(key.indexOf('_title') == key.length-6 ) {
        id = key.substr(0, key.length-6);
        prop = 'title';
      } else if(key.indexOf('_content') == key.length-8 ) {
        id = key.substr(0, key.length-8);
        prop = 'inner';
      } else if(key.indexOf('_legend') == key.length-7 ) {
        id = key.substr(0, key.length-7);
        prop = 'legend';
      } else if(key.indexOf('_header') == key.length-7 ) {
        id = key.substr(0, key.length-7);
        prop = 'header';
      } else if(key.indexOf('_button') == key.length-7 ) {
        id = key.substr(0, key.length-7);
        prop = 'inner';
      }

      if(id != null) {
        id = prefix + id;
        if(this[id]) {
          e = this[id];
        } else {
          e = dijit.byId(id);
          if(!e) {
            e = dojo.byId(id);
          }
        }
      }
      var index = -1;
      if(!e) {
        // see if there are indexed items
        e = dojo.byId(id+'1');
        if(e) {
          index = 1;
        }
      }
      while(e && prop) {
        if(prop == 'inner') {
          if(e.domNode) {
            e = e.domNode;
          }
          e.innerHTML = text;
        }
        else if(prop == 'legend') {
          // this is for field set legends
          if (e.firstElementChild === undefined) {
            var child = e.firstChild;
            while (child) {
              if (child.nodeType == 1 /*Node.ELEMENT_NODE*/) {
                child.innerHTML = text;
                break;
              }
              child = child.nextSibling;
            }
          }
          else {
            e.firstElementChild.innerHTML = text;
          }
        }
        else if(prop == 'label' && e.setLabel) {
          // this is for Dojo menu items
          e.setLabel(text);
        }
        else if(prop == 'title' && e.setTitle) {
          e.setTitle(text);
        }
        else if(e.set) {
          e.set(prop, text);
        }
        else if(prop == 'title' && e.title) {
          e.title = text;
        }
        if(index != -1) {
          index++;
          e = dojo.byId(id+index);
        } else {
          e = null;
        }
      }
    },

    /**
     * Inject localization strings into DOM elements using a naming convention.
     * <p>
     * Iterates over all keys in the bundle (assumed to have been previously loaded) and matches them to
     * DOM elements ID based on a naming convention.
     * <code>
     *   errorMessage_label=Here is an error Message.
     * </code>
     * errorMessage will be the DOM id it tries to match on and label is the type of element to set the value on.
     * Supported types:
     * <ul>
     *   <li>label: sets a label</li>
     *   <li>title: sets a title</li>
     *   <li>legend - sets a legend in a fieldset</li>
     *   <li>content : sets innerHTML</li>
     * </ul>
     * </p>
     * @param bundleName - name of the mesages bundle to use as the source for translations
     * @param prefix - id prefix to match on when getting id's from the dom
     */
    localizeDom: function(/*String*/ bundleName, /*Optional|String*/ prefix) {
      var key;
      if(pentaho && pentaho.common && pentaho.common.Messages) {
        var bundle = pentaho.common.Messages.getBundle(bundleName);
        if (bundle) {
          for (key in bundle) {
            if (bundle.hasOwnProperty(key)) {
              this.localizeDomCtrl(key, pentaho.common.Messages.getString(key), prefix);
            }
          }
        }
      } else {
        console.log("pentaho.common.Messages not available for localizing the DOM");
      }
    }

  }
});