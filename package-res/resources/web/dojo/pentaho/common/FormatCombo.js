define( [ "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
    "dojo/_base/lang",
    "dojo/domReady!" ],
  function( declare, ComboBox, Memory, lang ) {

    var defaultFormats = [
      { name: "#,###;(#,###)", type: "numeric" },
      { name: "#,###.00;(#,###.00)", type: "numeric" },
      { name: "$ #,###;($ #,###)", type: "numeric" },
      { name: "$ #,##0.00;($ #,##0.00)", type: "numeric" },
      { name: "#.#%;(#.#%)", type: "numeric" },

      { name: "MM-dd-yyyy", type: "date" },
      { name: "dd-MM-yyyy", type: "date" },
      { name: "MM/dd/yyyy", type: "date" },
      { name: "yyyy-MM-dd HH:mm:ss", type: "date" }
    ];

    var formatStore;

    return declare( "pentaho.common.FormatCombo", [ ComboBox ], {

      dataType: "numeric",
      placeHolder: "Type or select your format",
      searchAttr: "name",
      labelAttr: "label",
      labelType: "html",
      orient: ["below-centered", "below", "before"],

      constructor: function( args ) {
        lang.mixin( this, args );

        // add a pentaho css class to the base class
        this.baseClass = "pentahoFormatCombo " + this.baseClass;

        if ( args && args.formats ) {
          formatStore = new Memory( { data: args.formats } );
        } else {
          formatStore = new Memory( { data: defaultFormats } );
        }
        this.store = formatStore;

        if ( args && args.dataType ) {
          this.setDataType( args.dataType );
        } else {
          this.setDataType( this.dataType );
        }

      },

      setDataType: function( dataType ) {
        this.dataType = dataType;
        this.query = { type: dataType };
      },

      /**
       * Override this function to provide a fallback if no label is defined in the item
       */
      labelFunc: function(item, store){
        if ( item[this.labelAttr] ) {
          return item[this.labelAttr];
        } else {
          return item.name;
        }
      }

    } );
  }
);
