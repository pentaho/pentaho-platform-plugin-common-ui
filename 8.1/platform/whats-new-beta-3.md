---
title: What's new and changed in the Platform JavaScript APIs beta 3
description: Describes the new and changed features in the beta 3 of the Platform JavaScript APIs.
layout: 8.1_default
---

## Platform JavaScript APIs

### Data API

1. Removed support for the old `isDiscrete` property of model attributes.

2. Added the property `isKey` to model attributes that allows indicating that, together, 
   the value of all `isKey` attributes identify each row.
   See [pentaho.data.ITable#isColumnKey]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.data.ITable#isColumnKey'}}){{site.starNew}}.

3. Added the method 
   [pentaho.data.ITable#getColumnProperty]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.data.ITable#getColumnProperty'}}){{site.starNew}}
   that exposes the value of metadata properties of model attributes.
   
4. The method `getColumnIndexByAttribute` has been renamed to
   [pentaho.data.ITable#getColumnIndexById]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.data.ITable#getColumnIndexById'}}).

5. Added the method 
   [pentaho.data.ITable#getCell]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.data.ITable#getCell'}}){{site.starNew}}
   that allows to simultaneously obtain the value and formatted value of a cell.


6. Added the [pentaho/data/util]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.data.util'}}){{site.starNew}} module
   with several useful data related methods.

    
### Data / Filter API

1. Added the property 
   [pentaho.data.filter.spec.IIsLike#isCaseInsensitive]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.data.filter.spec.IIsLike#isCaseInsensitive'}}){{site.starNew}}.

### Type API

1. Simple types are now immutable.
   The [formatted]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.Simple#formatted'}}) 
   property is now read-only.
   
2. Types can now be declared as **entities**, 
   meaning that their instances have a meaningful business identity;
   that the value of the [pentaho.type.Value#$key]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.Value#$key'}})
   property has business meaning.
   When setting the value of properties or configuring a value, special rules apply to entity types.
   See [pentaho.type.Type#isEntity]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.Type#isEntity'}}){{site.starNew}}.

3. Complex types can now be declared immutable, by specifying
   [pentaho.type.Complex.Type#isReadOnly]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.Complex.Type#isReadOnly'}}){{site.starNew}}.
   When setting the value of properties or configuring values, 
   values of immutable types are handled specially.

4. Configuring a value with its current specification no longer causes changes to be perceived.
   See [pentaho.type.Value#configure]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.Value#configure'}}).

5. Types can now indicate their continuous or categorical nature through the
   [pentaho.type.Type#isContinuous]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.Type#isContinuous'}}){{site.starNew}}
   property.

6. Reviewed the action classes, [pentaho.type.action]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.action'}}).

7. Reviewed the process of calling `will:change` listeners when changes occur. 
   It is now ensured that listeners are called again if a value below in the bubbling chain is modified after 
   they have ran.
   
8. Added the ability to specify the resolution 
   [ranking]({{site.refDocsUrlPattern81 | replace: '$', 'pentaho.type.spec.IContextTypeConfiguration#ranking'}}) of types.

### Visualization API

See [What's new and changed in the Visualization API beta 3]({{ "/8.1/platform/visual/whats-new-beta-3" | relative_url }}).

