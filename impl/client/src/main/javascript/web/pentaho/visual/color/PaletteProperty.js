/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "pentaho/type/Property",
  "./Level",
  "./Palette",
  "pentaho/type/loader",
  "pentaho/i18n!messages",
  "pentaho/type/ValidationError",
  "pentaho/type/util",
  "pentaho/util/object",
  "pentaho/util/error",

  "pentaho/module/instancesOf!pentaho/visual/color/Palette"
], function(module, Property, PaletteLevel, Palette, typeLoader, bundle, ValidationError,
            typeUtil, O, error, allPalettes) {

  "use strict";

  var __paletteLevelType = PaletteLevel.type;
  var __ListLevelType = typeLoader.resolveType([PaletteLevel]);

  /**
   * @name pentaho.visual.color.PalettePropertyType
   * @class
   * @extends pentaho.type.PalettePropertyType
   *
   * @classDesc The type class of {@link pentaho.visual.color.PaletteProperty}.
   */

  /**
   * @name pentaho.visual.color.PaletteProperty
   * @class
   * @extends pentaho.type.PaletteProperty
   *
   * @amd pentaho/visual/color/PaletteProperty
   *
   * @classDesc The `PaletteProperty` class represents a color palette of a visualization and defines its
   * required capabilities.
   *
   * The capabilities of the color palette are described by the
   * [levels]{@link pentaho.visual.color.PalettePropertyType#levels} attribute.
   *
   * The [valueType]{@link pentaho.type.PalettePropertyType#valueType} of a property of this type is
   * [Palette]{@link pentaho.visual.color.Palette}.
   *
   * The [defaultValue]{@link pentaho.type.PalettePropertyType#defaultValue} of a property of this type is
   * initialized to a function that queries registered palette instances for one with a compatible level.
   * It does not choose a palette that another palette property in the same visualization model is already using.
   * During construction, this exclusion rule only covers properties which are defined before it.
   *
   * @description This class was not designed to be constructed directly.
   */
  var PaletteProperty = Property.extend(/** @lends pentaho.visual.color.PaletteProperty# */{

    $type: /** @lends pentaho.visual.color.PalettePropertyType# */{

      valueType: Palette,

      defaultValue: function(propType) {

        var otherUsedPaletteIds = propType.__collectOtherUsedPalettesIdsOn(this);

        var validLevels = propType.levels;
        var paletteType = propType.valueType;

        // Use the first palette (highest rankig) that would make the property valid.
        var i = -1;
        var L = allPalettes.length;
        while(++i < L) {
          var palette = allPalettes[i];
          if(paletteType.is(palette) &&
             validLevels.has(palette.level) &&
             !O.hasOwn(otherUsedPaletteIds, palette.$uid)) {
            return palette;
          }
        }

        return null;
      },

      /**
       * Gets a set of used palette identifiers on the given owner.
       *
       * @param {pentaho.type.Complex} owner - The owner complex.
       * @return {object.<string, boolean>} The set of used identifiers.
       */
      __collectOtherUsedPalettesIdsOn: function(owner) {

        var paletteIds = Object.create(null);

        owner.$type.each(function(propType) {
          if(propType !== this && propType instanceof PaletteProperty.Type) {
            var palette = owner.get(propType);
            if(palette) {
              paletteIds[palette.$uid] = true;
            }
          }
        }, this);

        return paletteIds;
      },

      // region Levels
      // Defaults to all palette measurement levels
      __levels: __paletteLevelType.domain,

      /**
       * Gets or sets the array of possible measurement levels of color palettes
       * that are set on this property.
       *
       * ### This attribute is *Monotonic*
       *
       * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
       *
       * In this case, a measurement level can be removed from a color palette property,
       * but one cannot be added.
       *
       * ### This attribute is *Inherited*
       *
       * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
       *
       * The first set local value must respect the _monotonicity_ property with the inherited value.
       *
       * ### Other characteristics
       *
       * When set to a {@link Nully} value, the set operation is ignored.
       *
       * The root [visual.color.PaletteProperty]{@link pentaho.visual.color.PaletteProperty} has
       * a `levels` attribute which is the list of all possible color palette measurement levels.
       *
       * The returned array or its elements should not be modified.
       *
       * @type {pentaho.type.List.<pentaho.visual.color.Level>}
       *
       * @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
       * [subtypes]{@link pentaho.type.Type#hasDescendants}.
       */
      get levels() {
        return this.__levels;
      },

      set levels(values) {
        if(values == null) return;

        // Validation Rules
        // 1. Cannot change if already have descendants
        // 2. Cannot remove all measurement levels.
        // 3. Cannot add new levels. Can only restrict, by removing some of the inherited/current levels.

        this._assertNoSubtypesAttribute("levels");

        if(!Array.isArray(values)) values = [values];

        var levels = values.map(function(value) { return this.to(value); }, __paletteLevelType);

        // Intersect with current list.
        var levelsNew = __paletteLevelType.__intersect(this.__levels.toArray(), levels);

        if(!levelsNew.length)
          throw error.argInvalid("levels", bundle.structured.errors.property.noLevels);

        levelsNew.sort(__paletteLevelType.compareElements.bind(__paletteLevelType));

        // TODO: Had to remove the {isReadOnly: true}.
        // Find a way to only allow updating/replacing existing elements without
        // letting to add new keys or remove existing keys.
        this.__levels = new __ListLevelType(levelsNew);
      },
      // endregion

      // region Validation

      /**
       * Determines if this color palette property is valid on the given visualization model.
       *
       * If generic property validation fails, those errors are returned.
       *
       * Otherwise, validity is further determined as follows:
       *
       * 1. The current palette value must have a level which is one of the property's allowed levels.
       *
       * @param {pentaho.visual.base.Model} model - The visualization model.
       *
       * @return {Array.<pentaho.type.ValidationError>} A non-empty array of `ValidationError` or `null`.
       */
      validateOn: function(model) {

        var errors = this.base(model);
        if(!errors) {
          var palette = model.get(this);
          if(palette) {
            var addErrors = function(newErrors) {
              errors = typeUtil.combineErrors(errors, newErrors);
            };

            // Validate palette's level is one of the property's allowed levels.
            var level = palette.get("level"); // Want Simple value
            if(level && !this.levels.has(level.$key)) {
              // Should be one of the property's levels.
              addErrors(new ValidationError(bundle.format(
                bundle.structured.errors.property.levelIsNotOneOfPalettePropertyLevels,
                {
                  property: this,
                  level: level,
                  propertyLevels: ("'" + this.levels.toArray().join("', '") + "'")
                })));
            }
          }
        }

        return errors;
      },
      // endregion

      // region Serialization
      /** @inheritDoc */
      _fillSpecInContext: function(spec, keyArgs) {

        var any = this.base(spec, keyArgs);

        var levels = O.getOwn(this, "__levels");
        if(levels) {
          any = true;
          spec.levels = levels.toSpecInContext(keyArgs);
        }

        return any;
      }
      // endregion
    }
  })
  .localize({$type: bundle.structured.Property})
  .configure({$type: module.config});

  return PaletteProperty;
});
