dojo.provide('pentaho.common.TemplatePicker');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.button');
dojo.require('pentaho.common.Dialog');
dojo.declare(
     'pentaho.common.TemplatePicker',
     [pentaho.common.Dialog],
     {
        buttons: [],
        
        templates: [],
        
        pageNo: 0,
        
        hasTitleBar: false,

        hasBorder: false,
        
        templateSelectedCallback: null,
        
        updatePageArrows: function() {
            this.prevSetBtn.set('disabled',this.pageNo == 0);
            this.nextSetBtn.set('disabled',(this.pageNo+1)*6>=this.templates.length);
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
                    this['templateName'+idx].innerHTML = this.templates[idx+start].name;
                    dojo.removeClass(this['templateImg'+idx], 'hidden');
                    dojo.addClass(this['templateName'+idx], 'fade');
                } else {
                    dojo.addClass(this['templateImg'+idx], 'hidden');
                    dojo.removeClass(this['templateName'+idx], 'fade');
                    this['templateName'+idx].innerHTML = '';
                }
            }
            this.updatePageArrows();
        },
                
        templatePath: dojo.moduleUrl('pentaho.common', 'TemplatePicker.html'),
      
        postCreate: function() {
            this.inherited(arguments);
            this.closeBtn.callback = dojo.hitch(this, this.closeClick);
            this.prevSetBtn.callback = dojo.hitch(this, this.prevPage);
            this.nextSetBtn.callback = dojo.hitch(this, this.nextPage);
            dojo.connect(this.templateImg0,'onclick', this, 'imgClick');
            dojo.connect(this.templateImg1,'onclick', this, 'imgClick');
            dojo.connect(this.templateImg2,'onclick', this, 'imgClick');
            dojo.connect(this.templateImg3,'onclick', this, 'imgClick');
            dojo.connect(this.templateImg4,'onclick', this, 'imgClick');
            dojo.connect(this.templateImg5,'onclick', this, 'imgClick');
            dojo.connect(this.templateName0,'onclick', this, 'imgClick');
            dojo.connect(this.templateName1,'onclick', this, 'imgClick');
            dojo.connect(this.templateName2,'onclick', this, 'imgClick');
            dojo.connect(this.templateName3,'onclick', this, 'imgClick');
            dojo.connect(this.templateName4,'onclick', this, 'imgClick');
            dojo.connect(this.templateName5,'onclick', this, 'imgClick');
        },
       
        imgClick: function(event) {
            var idx = parseInt(dojo.attr(event.target, 'idx'));
            var idx = this.pageNo * 6 + idx;
            if(this.templateSelectedCallback) {
                this.templateSelectedCallback(idx);
            }
        },
       
        closeClick: function() {
            this.buttonClick(0);
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
        }
       
    }
);
