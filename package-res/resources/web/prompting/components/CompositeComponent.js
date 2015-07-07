/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
 *
 */

define([ 'cdf/lib/jquery', 'cdf/components/BaseComponent', 'cdf/dashboard/Utils' ], function($, BaseComponent, Utils) {

  return BaseComponent.extend({
    components : undefined, // array of components

    executeAtStart : true,

    getComponents : function() {
      return this.components;
    },

    clear : function() {
      if (this.components) {
        $.each(this.components, function(i, c) {
          c.clear();
        });
      }
      this.base();
    },

    getClassFor : function(component) {
      return component.cssClass;
    },

    getMarkupFor : function(component) {
      var _class = this.getClassFor(component);
      var html = '<div id="' + component.htmlObject + '"';
      if (_class) {
        html += ' class="' + _class + '"';
      }
      html += '></div>';
      return html;
    },

    update : function() {
      var html = '';

      if (this.label !== undefined) {
        html += '<fieldset>';
        if (this.label.length > 0) {
          html += '<legend>' + Utils.escapeHtml(this.label) + '</legend>';
        }
        html += '<div>';
      }

      if (this.components && this.components.length > 0) {
        html += this.updateInternal();
      }

      if (this.label !== undefined) {
        html += '</div></fieldset>';
      }

      var $htmlObject = $('#' + this.htmlObject);
      $htmlObject.html(html);

      if (this.cssClass) {
        $htmlObject.addClass(this.cssClass);
      }
    },

    updateInternal : function() {
      var html = '';
      $.each(this.components, function(i, c) {
        html += this.getMarkupFor(c);
      }.bind(this));
      return html;
    },

    /**
     * Pre-order traversal of a component and its descendants.
     */
    // TODO REVIEW!
    mapComponents : function(c, f, x) {
      f.call(x, c);
      if (c.components) {
        this.mapComponentsList(c.components, f, x);
      }
      return c;
    },

    /**
     * Pre-order traversal of components given a list of root components.
     */
    // TODO REVIEW!
    mapComponentsList : function(comps, f, x) {
      var me = this;
      $.each(comps, function(i, c) {
        me.mapComponents(c, f, x);
      });
      return me;
    }

  });
});
