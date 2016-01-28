/**
 * Define your custom tags inside this block
 */
exports.defineTags = function (dictionary) {
  /**
   * Tag options:
   * 
   * @property {boolean}  canHaveType              Default Value (false)
   * @property {boolean}  canHaveName              Default Value (false)
   * @property {boolean}  isNamespace              Default Value (false)
   * @property {boolean}  mustHaveValue            Default Value (false)
   * @property {boolean}  mustNotHaveDescription   Default Value (false)
   * @property {boolean}  mustNotHaveValue         Default Value (false)
   * @property {function} onTagged
   */
  dictionary.defineTag('amd', {

    /**
     * A callback function executed when the tag is found
     * @param  {Object} doclet Doclet where the tag was "tagged"
     * @param  {Object} tag    The tag data
     */
    onTagged: function (doclet, tag) {
      doclet.amd = tag;
    }
  }); 
};