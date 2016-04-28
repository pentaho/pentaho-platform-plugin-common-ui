define( [ "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
    "dojo/_base/lang" ],
  function( declare, ComboBox, Memory, lang ) {

    // these defaults are compatible with mondrian formatting. slightly different than java standards (dates especially)
    var defaultFormats = [
      { name: "0",            type: "numeric", category: "number" },
      { name: "0.00",         type: "numeric", category: "number" },
      { name: "#,##0",        type: "numeric", category: "number" },
      { name: "#,###.00",     type: "numeric", category: "number" },
      { name: "-#,###.00",    type: "numeric", category: "number" },
      { name: "(#,###.00)",   type: "numeric", category: "number" },

      { name: "$ #,##0",               type: "numeric", category: "currency" },
      { name: "$ #,##0.00",            type: "numeric", category: "currency" },
      { name: "$ -#,##0.00",           type: "numeric", category: "currency" },
      { name: "$ (#,##0.00)",          type: "numeric", category: "currency" },
      { name: "$ #,##0.00;(#,##0.00)", type: "numeric", category: "currency" },

      { name: "0 %",     type: "numeric", category: "percent" },
      { name: "0.00 %",  type: "numeric", category: "percent" },

      { name: "#E+#",     type: "numeric",  category: "scientific" },
      { name: "0.00E+00", type: "numeric",  category: "scientific" },
      { name: "##0.0E+0", type: "numeric",  category: "scientific" },

      { name: "M/d", type: "date", category: "date" },
      { name: "M/d/yy", type: "date", category: "date" },
      { name: "MM/dd/yy", type: "date", category: "date" },
      { name: "d-MMM", type: "date", category: "date" },
      { name: "d-MMM-yy", type: "date", category: "date" },
      { name: "MMM-yy", type: "date", category: "date" },
      { name: "MMMMM-yy", type: "date", category: "date" },
      { name: "MMMMM d, yyyy", type: "date", category: "date" },
      { name: "M/d/yy h:mm AM/PM", type: "date", category: "date" },
      { name: "M/d/yy h:mm", type: "date", category: "date" },
      { name: "M/d/yyyy", type: "date", category: "date" },
      { name: "d-MMM-yyyy", type: "date", category: "date" },

      { name: "h:mm", type: "date", category: "time" },
      { name: "h:mm AM/PM", type: "date", category: "time" },
      { name: "h:mm:ss", type: "date", category: "time" },
      { name: "h:mm:ss AM/PM", type: "date", category: "time" },
      { name: "[h]:mm:ss", type: "date", category: "time" },

    ];

    var formatStore;

    return declare( "pentaho.common.FormatCombo", [ ComboBox ], {

      dataType: "numeric",
      placeHolder: "Type or select your format",
      searchAttr: "name",
      labelAttr: "label",
      labelType: "html",
      orient: ["below-centered", "below", "before"],
      ignoreCase: false,

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

      setDataType: function( dataType, category ) {
        this.dataType = dataType;
        if ( category ) {
          this.category = category;
          this.query = { type: dataType, category: category };
        } else {
          this.query = { type: dataType };
        }
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
