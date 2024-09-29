/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


/**
 * The Composite Component Class
 *
 * @name CompositeComponent
 * @class
 *
 * @property {Array|BaseComponent} components The array of components
 * @property {boolean} executeAtStart True if this component should be executed on the first update of the Dashboard
 * object were it is, False otherwise
 */
define([ 'common-ui/jquery-clean', 'cdf/components/BaseComponent', 'cdf/dashboard/Utils' ], 
  function($, BaseComponent, Utils) {

  return BaseComponent.extend({
    components : undefined, // array of components

    executeAtStart : true,

    /**
     * Gets the array of components
     *
     * @name CompositeComponent#getComponents
     * @method
     * @returns {Array|BaseComponent} The array of components
     */
    getComponents : function() {
      return this.components;
    },

    /**
     * Removes the list of components
     *
     * @name CompositeComponent#clear
     * @method
     */
    clear : function() {
      if (this.components) {
        $.each(this.components, function(i, c) {
          c.clear();
        });
      }
      this.base();
    },

    /**
     * Removes the component
     *
     * @name CompositeComponent#remove
     * @method
     */
    remove: function() {
      this.placeholder().remove();
    },

    /**
     * Gets the CssClass assigned to the component
     *
     * @name CompositeComponent#getClassFor
     * @method
     * @param {BaseComponent} component The component to get the css class
     * @returns {string|*|string|string} The css class
     */
    getClassFor : function(component) {
      return component.cssClass;
    },

    /**
     * Get the markup code for the component
     *
     * @name CompositeComponent#getMarkupFor
     * @method
     * @param {BaseComponent} component The Component to get the Markup
     * @returns {String} String with the markup
     */
    getMarkupFor : function(component) {
      var _class = this.getClassFor(component);
      var html = '<div id="' + component.htmlObject + '"';
      if (_class) {
        html += ' class="' + _class + '"';
      }
      html += '></div>';
      return html;
    },

    /**
     * Override to the CDF update
     *
     * @name CompositeComponent#update
     * @method
     */
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

    /**
     * Gets the html markup for each one if its components
     *
     * @name CompositeComponent#updateInternal
     * @method
     * @returns {String} The html markup for all its components
     */
    updateInternal : function() {
      var html = '';
      $.each(this.components, function(i, c) {
        html += this.getMarkupFor(c);
      }.bind(this));
      return html;
    },
  });
});
