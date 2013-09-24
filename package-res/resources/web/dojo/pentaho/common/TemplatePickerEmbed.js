dojo.provide('pentaho.common.TemplatePickerEmbed');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.button');
dojo.require('pentaho.common.SmallImageButton');
dojo.declare(
     'pentaho.common.TemplatePickerEmbed',
     [dijit._Widget, dijit._Templated],
     {
        buttons: [],
        
        templates: [],
        
        pageNo: 0,
        
        hasTitleBar: false,
        
        widgetsInTemplate: true,

        hasBorder: false,
        
        templateSelectedCallback: null,
        
        updatePageArrows: function() {
            if(this.prevSetBtn.set) {
                this.prevSetBtn.set('disabled',this.pageNo == 0);
            }
            if(this.nextSetBtn.set) {
                this.nextSetBtn.set('disabled',(this.pageNo+1)*6>=this.templates.length);
            }
        },
        
        setTemplates: function(templates) {
            this.templates = templates;
            this.showPage();
            this.updatePageArrows();
        },
        
        showPage: function() {
            var start = this.pageNo * 6;
            for(var idx=0; idx<6; idx++) {
            
                if(idx+start < this.templates.length) {
                    this['templateImg'+idx].src = this.templates[idx+start].imagePath;
                    if(this.templates[idx+start].description && this.templates[idx+start].description != null) {
                      this['templateImg'+idx].title = this.templates[idx+start].description;
                    }
                  this['templateName'+idx].innerHTML = this.templates[idx+start].name;
                    dojo.removeClass(this['templateImg'+idx], 'hidden');
                    dojo.addClass(this['templateName'+idx], 'fadeEmbed');
                    if(this.templates[idx+start].selected) {
                        dojo.addClass(this['templateName'+idx], 'pentaho-selection-dialog-selected');
                        dojo.addClass(this['templateImgCell'+idx], 'pentaho-selection-dialog-selected');
                        dojo.removeClass(this['templateName'+idx], 'pentaho-selection-dialog-unselected');
                        dojo.removeClass(this['templateImgCell'+idx], 'pentaho-selection-dialog-unselected');
                    } else {
                        dojo.addClass(this['templateName'+idx], 'pentaho-selection-dialog-unselected');
                        dojo.addClass(this['templateImgCell'+idx], 'pentaho-selection-dialog-unselected');
                        dojo.removeClass(this['templateName'+idx], 'pentaho-selection-dialog-selected');
                        dojo.removeClass(this['templateImgCell'+idx], 'pentaho-selection-dialog-selected');
                    }
                } else {
                    dojo.addClass(this['templateImg'+idx], 'hidden');
                    dojo.removeClass(this['templateName'+idx], 'fadeEmbed');
                    dojo.addClass(this['templateImgCell'+idx], 'pentaho-selection-dialog-unselected');
                    dojo.removeClass(this['templateImgCell'+idx], 'pentaho-selection-dialog-selected');
                    dojo.removeClass(this['templateName'+idx], 'pentaho-selection-dialog-selected');
                    this['templateName'+idx].innerHTML = '';
                }
            }
            this.updatePageArrows();
        },
                
        templatePath: dojo.moduleUrl('pentaho.common', 'TemplatePickerEmbed.html'),
      
        postCreate: function() {
            this.inherited(arguments);
            this.prevSetBtn.callback = dojo.hitch(this, this.prevPage);
            this.nextSetBtn.callback = dojo.hitch(this, this.nextPage);

            for( var idx=0; idx<6; idx++ ) {
                dojo.connect(this['templateImg'+idx],'onclick', this, 'imgClick');
                dojo.connect(this['templateName'+idx],'onclick', this, 'imgClick');
                dojo.connect(this['templateImg'+idx],'ondblclick', this, 'imgDblClick');
                dojo.connect(this['templateName'+idx],'ondblclick', this, 'imgDblClick');
                dojo.connect(this['templateImgCell'+idx],'onmouseover', this, 'mouseOver');
                dojo.connect(this['templateImgCell'+idx],'onmouseout', this, 'mouseOut');
                dojo.connect(this['templateName'+idx],'onmouseover', this, 'mouseOver');
                dojo.connect(this['templateName'+idx],'onmouseout', this, 'mouseOut');
            }
            
        },
       
        mouseOver: function(event) {
            var idx = parseInt(dojo.attr(event.target, 'idx'));
            
            if( this.templates[idx] && this.templates[idx].selected ) {
                return;
            }
            
            var node = this['templateImgCell'+idx];
            if( node ) {
                dojo.addClass(node,'pentaho-selection-dialog-hover');
            }
            var node = this['templateName'+idx];
            if( node ) {
                dojo.addClass(node,'pentaho-selection-dialog-hover');
            }
        },
       
        mouseOut: function(event) {
            var idx = parseInt(dojo.attr(event.target, 'idx'));
            var node = this['templateImgCell'+idx];
            if( node ) {
                dojo.removeClass(node,'pentaho-selection-dialog-hover');
            }
            var node = this['templateName'+idx];
            if( node ) {
                dojo.removeClass(node,'pentaho-selection-dialog-hover');
            }
        },
       
        imgDblClick: function(event) {
            var idx = parseInt(dojo.attr(event.target, 'idx'));
            var templateNo = this.pageNo * 6 + idx;
            if(this.templateDblClickCallback) {
                this.templateDblClickCallback(templateNo);
            }
        },
       
        imgClick: function(event) {
            var idx = parseInt(dojo.attr(event.target, 'idx'));
            var templateNo = this.pageNo * 6 + idx;
            this.select(idx, templateNo);
            if(this.templateSelectedCallback) {
                this.templateSelectedCallback(templateNo);
            }
        },
       
        prevPage: function() {
            if(this.pageNo == 0) {
                return;
            }
            this.pageNo--;
            this.showPage();
        },
       
        nextPage: function() {
            if((this.pageNo+1)*6>=this.templates.length) {
                return;
            }
            this.pageNo++;
            this.showPage();
        },
        
        select: function(idx, templateNo) {
            for( var n=0; n<this.templates.length; n++) {
                this.templates[n].selected = false;
            }
            this.templates[templateNo].selected = true;
            var node = this['templateImgCell'+idx];
            dojo.removeClass(node,'pentaho-selection-dialog-hover');
            var node = this['templateName'+idx];
            dojo.removeClass(node,'pentaho-selection-dialog-hover');
            this.showPage();
        }
       
    }
);
