pen.define([
        "cdf/lib/CCC/def", 
        "cdf/lib/CCC/pvc-d1.0", 
        "cdf/lib/CCC/protovis",
        "common-ui/vizapi/VizController",
        "common-ui/vizapi/ccc/ccc_analyzer_plugin" // TODO: temporary dependency due to debug loading time problems
    ],
function(def, pvc, pv){

    // TODO: with requireJS is this still needed?
    // Declare **global** pentaho namespace variable
    pentaho = typeof pentaho != "undefined" ? pentaho : {};
    
    // This allows def.types below not installing 'pentaho' on the global space...
    def.globalSpace('pentaho', pentaho);
    
    pentaho.visualizations || (pentaho.visualizations = {});
    
    function defVisualization(viz){
        pentaho.visualizations.push(viz);
    }
    
    defCCCVisualizations();
    
    // --------------
    
    // Install pentaho trends on CCC trends
    pentaho.trends.types().forEach(function(trendType){
        var trendInfo = pentaho.trends.get(trendType);
        
        pvc.trends.define(trendType, trendInfo);
    });
    
    // --------------
    
    function defCCCVisualizations(){
        defVisualization({
            id:       'ccc_bar',
            type:     'barchart',
            source:   'CCC',
            name:     vizLabel('VERTICAL_BAR'),
            'class':  'pentaho.ccc.BarChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: def.array.appendMany(
                    createDataReq('VERTICAL_BAR', {options: false}),
                    createTrendsDataReqs({separator: false}),
                    [ createChartOptionsDataReq(true) ])
            }],
            menuOrdinal: 100
        });

        defVisualization({
            id:       'ccc_barstacked',
            type:     'barchart',
            source:   'CCC',
            name:     vizLabel('STACKED_VERTICAL_BAR'),
            'class':  'pentaho.ccc.StackedBarChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: createDataReq('STACKED_VERTICAL_BAR')
            }],
            menuOrdinal: 110
        });

        defVisualization({
            id:       'ccc_horzbar',
            type:     'horzbarchart',
            source:   'CCC',
            name:     vizLabel('HORIZONTAL_BAR'),
            'class':  'pentaho.ccc.HorizontalBarChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: createDataReq('HORIZONTAL_BAR')
            }],
            menuOrdinal: 130,
            menuSeparator: true
        });

        defVisualization({
            id:       'ccc_horzbarstacked',
            type:     'horzbarchart',
            source:   'CCC',
            name:     vizLabel('STACKED_HORIZONTAL_BAR'),
            'class':  'pentaho.ccc.HorizontalStackedBarChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs : createDataReq('STACKED_HORIZONTAL_BAR')
            }],
            menuOrdinal: 140
        });

        defVisualization({
            id:       'ccc_barnormalized',
            type:     'barchart',
            source:   'CCC',
            name:     vizLabel('PCT_STACKED_VERTICAL_BAR'),
            'class':  'pentaho.ccc.NormalizedBarChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs : createDataReq('PCT_STACKED_VERTICAL_BAR')
            }],
            menuOrdinal: 120
        });

        defVisualization({
            id:       'ccc_horzbarnormalized',
            type:     'horzbarchart',
            source:   'CCC',
            name:     vizLabel('PCT_STACKED_HORIZONTAL_BAR'),
            'class':  'pentaho.ccc.HorizontalNormalizedBarChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs : createDataReq('PCT_STACKED_HORIZONTAL_BAR')
            }],
            menuOrdinal: 150
        });

        defVisualization({
            id:       'ccc_line',
            type:     'linechart',
            source:   'CCC',
            name:     vizLabel('LINE'),
            'class':  'pentaho.ccc.LineChart',
            args: {
                // Default value for 'shape' data request
                shape: 'circle'
            },
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: def.array.appendMany(
                    createDataReq('LINE', {options: false}),
                    [
                     createShapeDataReq(),
                     createLineWidthDataReq(),
                    ],
                    createTrendsDataReqs(),
                    [ createChartOptionsDataReq(true) ])
            }],
            menuOrdinal: 160,
            menuSeparator: true
        });

        defVisualization({
            id:       'ccc_area',
            type:     'areachart',
            source:   'CCC',
            name:     vizLabel('STACKED_AREA'),
            'class':  'pentaho.ccc.StackedAreaChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: createDataReq('STACKED_AREA')
            }],
            menuOrdinal: 180
        });

        defVisualization({
            id:        'ccc_scatter',
            type:      'scatter',
            source:    'CCC',
            name:      vizLabel('SCATTER'),
            'class':   'pentaho.ccc.MetricDotChart',
            maxValues: [1000, 2500, 5000, 10000],
            args:      {},
            propMap:   [],
            dataReqs:  [{
                name: 'Default',
                reqs:  def.array.appendMany([
                    {
                        id: 'x',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('SCATTER_X'),
                        required: true,
                        allowMultiple: false
                    },
                    {
                        id: 'y',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('SCATTER_Y'),
                        required: true,
                        allowMultiple: false
                    },
                    {
                        id: 'rows',
                        dataType: 'string',
                        dataStructure: 'column',
                        caption: dropZoneLabel('SCATTER_ROW'),
                        required: true,
                        allowMultiple: true
                    },
                    {
                        id: 'color',
                        dataType: 'number, string',
                        dataStructure: 'column',
                        caption: dropZoneLabel('SCATTER_COL'),
                        required: false,
                        allowMultiple: false
                    },
                    {
                        id: 'size',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('SCATTER_Z'),
                        required: false,
                        allowMultiple: false
                    },
                    createMultiDataReq(),
                    createPatternDataReq(),
                    createColorSetDataReq(),
                    createReverseColorsDataReq()
                ],
                createTrendsDataReqs(),
                [ createChartOptionsDataReq(true)])
            }],
            menuOrdinal: 190,
            menuSeparator: true
        });

        defVisualization({
            id: 'ccc_barline',
            type: 'barchart',
            source: 'CCC',
            name: vizLabel('VERTICAL_BAR_LINE'),
            'class': 'pentaho.ccc.BarLineChart', // 
            args:  {
                // Default value for 'shape' data request
                shape: 'circle'
            },
            propMap: [],
            // dataReqs describes the data requirements of this visualization
            dataReqs: [{
                name: 'Default',
                reqs : [
                    createRowDataReq('VERTICAL_BAR_LINE_ROW'),
                    createColDataReq('VERTICAL_BAR_LINE_COL'),
                    def.set(
                        createMeaDataReq('VERTICAL_BAR_LINE_NUMCOL'), 
                        'required', false),
                    def.set(
                         createMeaDataReq('VERTICAL_BAR_LINE_NUMLINE'),
                         'id', 'measuresLine',
                         'required', false),
                    createMultiDataReq(),
                    createShapeDataReq(),
                    createLineWidthDataReq(),
                    createChartOptionsDataReq(true)
               ]
            }],
            menuOrdinal: 125
        });
        
        defVisualization({
            id: 'ccc_waterfall',
            type: 'waterfallchart',
            source: 'CCC',
            name: vizLabel('WATERFALL'),
            'class': 'pentaho.ccc.WaterfallChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: createDataReq('WATERFALL')
            }]
        });

        defVisualization({
            id:       'ccc_boxplot',
            type:     'boxplotchart',
            source:   'CCC',
            name:     vizLabel('BOXPLOT'),
            'class':  'pentaho.ccc.BoxplotChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: [
                    createRowDataReq('BOXPLOT_ROW'),
                    
                    def.set(createMeaDataReq('BOXPLOT_PCT50'), 
                                'allowMultiple', false,
                                'required', false),
                    {
                        id: 'percentil25',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('BOXPLOT_PCT25'),
                        required: false,
                        allowMultiple: false
                    },
                    {
                        id: 'percentil75',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('BOXPLOT_PCT75'),
                        required: false,
                        allowMultiple: false
                    },
                    {
                        id: 'percentil5',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('BOXPLOT_PCT05'),
                        required: false,
                        allowMultiple: false
                    },
                    {
                        id: 'percentil95',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('BOXPLOT_PCT95'),
                        required: false,
                        allowMultiple: false
                    },
                    createMultiDataReq(),
                    createChartOptionsDataReq()
                ]
            }]
        });

        defVisualization({
            id:       'ccc_pie',
            type:     'piechart',
            source:   'CCC',
            name:     vizLabel('MULTIPLE_PIE'),
            'class':  'pentaho.ccc.PieChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs : createDataReq("MULTIPLE_PIE", {multi: false})
                   
            }],
            menuOrdinal: 180
        });

        defVisualization({
            id:        'ccc_heatgrid',
            type:      'heatgrid',
            source:    'CCC',
            name:      vizLabel('HEATGRID'),
            'class':   'pentaho.ccc.HeatGridChart',
            maxValues: [500, 1000, 2000, 5000],
            args:      {
                // Default value for 'shape' data request
                shape:'square'
            },
            propMap:   [],
            dataReqs:  [{
                name: 'Default',
                reqs :[
                    {
                        id: 'rows',
                        dataType: 'string',
                        dataStructure: 'row',
                        caption:  dropZoneLabel('HEATGRID_ROW'),
                        required: true,
                        allowMultiple: true
                    },
                    {
                        id: 'columns',
                        dataType: 'string',
                        dataStructure: 'column',
                        caption: dropZoneLabel('HEATGRID_COL'),
                        required: false,
                        allowMultiple: true
                    },
                    {
                        id: 'color',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('HEATGRID_COLOR'),
                        required: false,
                        allowMultiple: false
                    },
                    {
                        id: 'size',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('HEATGRID_SIZE'),
                        required: false,
                        allowMultiple: false
                    },
                    createPatternDataReq(),
                    createColorSetDataReq(),
                    createReverseColorsDataReq(),
                    createShapeDataReq({"square": true, "circle": true}),
                    createChartOptionsDataReq(true)
                ]
            }],
            menuOrdinal: 200
        });
        
        defVisualization({
            id: 'ccc_treemap',
            type: 'treemapchart',
            source: 'CCC',
            name: vizLabel('TREEMAP'),
            'class': 'pentaho.ccc.TreemapChart',
            args:     {},
            propMap:  [],
            dataReqs: [{
                name: 'Default',
                reqs: [ 
                    def.set(createRowDataReq("TREEMAP_ROW"), 'required', true),
                    {
                        id: 'size',
                        dataType: 'number',
                        dataStructure: 'column',
                        caption: dropZoneLabel('TREEMAP_SIZE'),
                        required: false,
                        allowMultiple: false
                    },
                    createMultiDataReq(),
                    createChartOptionsDataReq(false)
                ]
            }]
        });
        
        defVisualization({
            id: 'ccc_bulletchart',
            type: 'bulletchart',
            source: 'CCC',
            name: 'Bullet Chart',
            'class': 'pentaho.ccc.BulletChart',

            args:     {},
            propMap:  [],
            dataReqs: [
            {
                name: 'Default',
                reqs :[
                {
                    id: 'rows',
                    dataType: 'string',
                    dataStructure: 'row',
                    caption: 'Across',
                    required: true
                },
                {
                    id: 'columns',
                    dataType: 'string',
                    dataStructure: 'column',
                    caption: 'Down',
                    required: true
                },
                {
                    id: 'measures',
                    dataType: 'number',
                    dataStructure: 'column',
                    caption: 'Values',
                    required: true
                },
                createChartOptionsDataReq()
                ]
            }
            ]
        });
        
        function label(prefix, id) { return (id && cvCatalog[(prefix || "") + id]) || ""; }
        
        function vizLabel(id) { return label('VIZ_', id) || id; }

        function dropZoneLabel(id, defaultLabel) {
            return label("dropZoneLabels_", id) ||
                   label("ropZoneLabels_", id) || 
                   defaultLabel || id;
        }
        
        function chartPropsLabel(id, defaultLabel) {
            return label("dlgChartProps", id) || defaultLabel || id;
        }
        
        function createRowDataReq(rowLabel){
            return {
                id: 'rows',
                dataType: 'string',
                dataStructure: 'column',
                caption: dropZoneLabel(rowLabel),
                required: false,
                allowMultiple: true,
                defaultAppend: true
            };
        }

        function createColDataReq(columnLabel){
            return {
                id: 'columns',
                dataType: 'string',
                dataStructure: 'column',
                caption: dropZoneLabel(columnLabel),
                required: false,
                allowMultiple: true
            };
        }

        function createMeaDataReq(measureLabel){
            return {
                id: 'measures',
                dataType: 'number',
                dataStructure: 'column',
                caption: dropZoneLabel(measureLabel),
                required: true,
                allowMultiple: true,
                defaultAppend: true
            };
        }

        function createMultiDataReq(){
            return {
                id: 'multi',
                dataType: 'string',
                dataStructure: 'column',
                caption: dropZoneLabel('MULTI_CHART'),
                allowMultiple: true,
                required: false
            };
        }
        
        function createShapeDataReq(valuesSet){
            var values = ['circle', 'cross', 'diamond', 'square', 'triangle'];
            if(valuesSet){
                values = values.filter(function(value){ return def.hasOwn(valuesSet, value); });
            }
            
            values.unshift('none');
            
            return {
                id: 'shape',
                dataType: 'string',
                values: values,
                ui: {
                    labels:  values.map(function(option){ return dropZoneLabel(option.toUpperCase()); }),
                    group:   'options',
                    type:    'combo',
                    caption: dropZoneLabel('BULLET_STYLE')
                }
            };
        }
        
        function createLineWidthDataReq(){
            return {
                id: 'lineWidth',
                dataType: 'string',
                values: ["1", "2", "3", "4", "5", "6", "7", "8"],
                ui: {
                    labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
                    group: "options",
                    type:  'combo',
                    caption: chartPropsLabel('LineWidth')
                }
            };
        }
        
        function createTrendsDataReqs(keyArgs){
            var types = ['none', 'linear'];
            return [
                {
                    id: 'trendType',
                    dataType: 'string',
                    values: types,
                    ui: {
                        labels:  types.map(function(option){ return dropZoneLabel('TREND_TYPE_' + option.toUpperCase()); }),
                        group: "options",
                        type:  'combo',
                        caption: dropZoneLabel('TREND_TYPE'),
                        seperator: def.get(keyArgs, 'separator', true)
                    }
                }, {
                    id: 'trendName',
                    dataType: 'string',
                    ui: {
                        group: 'options',
                        type:  'textbox',
                        caption: dropZoneLabel('TREND_NAME')
                    }
                }, {
                    id: 'trendLineWidth',
                    dataType: 'string',
                    values: ["1", "2", "3", "4", "5", "6", "7", "8"],
                    ui: {
                        labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
                        group: "options",
                        type:  'combo',
                        caption: dropZoneLabel('TREND_LINEWIDTH')
                    }
                }];
        }
        
        function createPatternDataReq(){
            return {
                id: 'pattern',
                dataType: 'string',
                values: ["GRADIENT", "3-COLOR", "5-COLOR"],
                ui: {
                    labels: ["GRADIENT", "3_STEP", "5_STEP"].
                            map(function(option){ return dropZoneLabel(option); }),
                    group: 'options',
                    type:  'combo',
                    caption: dropZoneLabel('PATTERN')
                }
            }; 
        }
        
        function createColorSetDataReq(){
            return {
                id: 'colorSet',
                dataType: 'string',
                values: ["ryg", "ryb", "blue", "gray"],
                ui: {
                    labels:  ["RYG", "RYB", "BLUE", "GRAY"].
                             map(function(option){ return dropZoneLabel("GRAD_" + option); }),
                    group:   'options',
                    type:    'combo',
                    caption: dropZoneLabel('COLORSET')
                }
            }; 
        }
        
        function createReverseColorsDataReq(){
            return {
                id: 'reverseColors',
                dataType: 'boolean',
                ui: {
                    label: dropZoneLabel('COLORSET_REVERSE'),
                    group: 'options',
                    type:  'checkbox'
                }
            }; 
        }
        
        function createChartOptionsDataReq(hasSeparator){
            return {
                id: "optionsBtn",
                dataType: 'none',
                ui: {
                    group:     "options",
                    type:      "button",
                    label:     dropZoneLabel('CHART_OPTIONS'),
                    seperator: hasSeparator || false
                }
            };
        }
        
        function createDataReq(chartId, options) {
            var json = [];
            
            if(def.get(options, 'row', true)){
                json.push(createRowDataReq(chartId + "_ROW"));
            }

            if(def.get(options, 'column', true)){
                json.push(createColDataReq(chartId + "_COL"));
            }
            
            if(def.get(options, 'measure', true)){
                json.push(createMeaDataReq(chartId + "_NUM"));
            }

            if(def.get(options, 'multi', true)){
                json.push(createMultiDataReq());
            }

            if(def.get(options, 'options', true)){
                json.push(createChartOptionsDataReq(false));
            }
            
            return json;
        }
    }

    // -------------
    // Axes are: row, column and measure.
    def
    .type('pentaho.ccc.Axis')
    .init(function(chart, axisId){
        this.chart = chart;
        this.id = axisId;

        // Every role, bound or not may have an entry here
        this.gemsByRole    = {}; // roleId -> [gem, ...]
        this.indexesByRole = {}; // roleId -> [number, ...]
        
        // Only bound roles will have an entry in this set
        this.boundRoles = {}; // roleId -> true

        // Bound roles will have an entry here,
        // in order of appearence in gems.
        this.boundRolesIdList = []; // [i] -> roleId

        this.gems  = this._getGems();
        this.depth = this.gems.length;
        this.formulas = [];
        
        this.gems.forEach(initGem, this);

        /** @instance */
        function initGem(gem, index){
            // Overwrite axis id with corresponding Axis instance
            gem.axis  = this;
            gem.index = index;

            var roleId = gem.role;
            if(roleId && roleId !== 'undefined'){
                if(this._ensureRole(roleId)){
                    /* New role */
                    this.boundRoles[roleId] = true;
                    this.boundRolesIdList.push(roleId);
                }
    
                var roleGems = this.gemsByRole[roleId];
                gem.roleLevel = roleGems.length;
                roleGems.push(gem);
    
                this.indexesByRole[roleId].push(index);
            }
            
            this.formulas.push(gem.formula);
        }
    })
    .add({
        defaultRole: null,

        _ensureRole: function(roleId){
            if(!this.gemsByRole[roleId]){
                this.gemsByRole[roleId]    = [];
                this.indexesByRole[roleId] = [];

                return true;
            }
        },
        
        configure: function(virtualItemStartIndex, cccDimNamesSet){
            this.configureDimensionGroups();
            return this.configureReaders(virtualItemStartIndex, cccDimNamesSet);
        },
        
        configureDimensionGroups: function(){
        },

        // We need to specify readers with indexes only because of unmapped
        // gems that reach the dataTable.
        // Because this is probably an analyzer bug,
        // we fix this adjusting the readers' indexes,
        // (and not filtering the table columns, which is more difficult to do).
        configureReaders: function(virtualItemStartIndex, cccDimNamesSet){
            var readers = this.chart.options.readers,
                index   = virtualItemStartIndex;

            this.cccDimList().forEach(function(dimName){
                if(!def.hasOwn(cccDimNamesSet, dimName)){
                    cccDimNamesSet[dimName] = true;
                    
                    var reader = {
                        names:   dimName, // when null, the reader simply consumes the index, and prevents a default reader
                        indexes: index
                    };
                    
                    readers.push(reader);
                    index++;
                }
            });

            return index;
        },
        
        /* Note this is called during base constructor. */
        _getGems: function(){
            var gems = this.chart._axesGemsInfo[this.id];
            var vizHelper = this.chart._vizHelper;
            if(vizHelper.completeAxisGemsMetadata){ // available on the client
                vizHelper.completeAxisGemsMetadata(this.id, gems);
            }
            
            return gems;
        },

        getAxisLabel: function(){
            var labels = def.query(this._getAxisLabelGems())
                            .where(function(gem){ return gem.cccDimName; })
                            .select(function(gem){ return gem.label; })
                            .array(),
                last   = labels.pop(),
                first  = labels.join(", ");
            
            if(first && last){
                return this.chart._message('chartAxisTitleMultipleDimText', [first, last]);
            }
            
            return first || last;
        },
        
        _getAxisLabelGems: function(){
            return this.gems;
        },

        buildHtmlTooltip: function(lines, complex, context){
            this.gems.forEach(
                this._buildGemHtmlTooltip.bind(this, lines, complex, context));
        },

        _buildGemHtmlTooltip: function(lines, complex, context, gem, index){
            /*
             * Multi-chart formulas are not shown in the tooltip
             * They're on the small chart's title
             */
            if(gem.cccDimName && gem.role !== this.chart._multiRole){
                var atom = complex.atoms[gem.cccDimName];
                if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)){
                    // ex: "Line: Ships"
                    lines.push(def.html.escape(gem.label) + ': ' + def.html.escape(atom.label));
                }
            }
        },

        /**
         * Obtains the ccc dimensions that this axis uses,
         * in the order they are laid out in
         * the CCC's virtual item.
         */
       cccDimList: def.method({isAbstract: true}),

       fillCellSelection: def.method({isAbstract: true}),

       getDrillDownInfo: function(complex){
            return null;
       },

       getDeepestInfo: function(complex){
            return null;
       }
    });

    // --------------------------

    /* Axis static factory method */
    pentaho.ccc.Axis.create = function(chart, axisId){
        var funClass;

        switch(axisId){
            case 'row':     funClass = pentaho.ccc.RowAxis;     break;
            case 'column':  funClass = pentaho.ccc.ColumnAxis;  break;
            case 'measure': funClass = pentaho.ccc.MeasureAxis; break;
            default: throw def.error.argumentInvalid("Undefined axis value '{0}'.", [axisId]);
        }
        
        return new funClass(chart);
    };

    // --------------------------

    def
    .type('pentaho.ccc.DiscreteAxis', pentaho.ccc.Axis)
    .init(function(chart, axisId){
        
        this.base(chart, axisId);
        
        var multiGems = this.gemsByRole[this.chart._multiRole];
        this.hasMulti = !!multiGems && 
                        def.query(multiGems)
                           .any(function(gem){ return !gem.isMeasureDiscrim; });
    })
    .postInit(function(){
        // Done here just to allow  more specific roles to be ensured first
        
        //this.base.apply(this, arguments);
        
        if(this.hasMulti){
            this._ensureRole(this.chart._multiRole);
        }
    })
    .add({
        _nonMultiGemFilter: function(gem){ 
            return gem.role !== this.chart._multiRole; 
        },
        
        /**
         * The union of the ccc dimensions of the roles of this axis.
         *
         * CCC dimension names are inferred based on the name of the
         * dimension group that is assigned to each role (name, name2, name3, ...).
         */
        cccDimList: function(){
            if(!this._cccDimList){
                // One dimension per gem
                var cccDimList = this._cccDimList = new Array(this.gems.length);

                // Unmapped gems may appear
                this.gems.forEach(function(gem){
                    gem.cccDimName =
                    cccDimList[gem.index] = this._getGemDimName(gem) || null;
                }, this);
            }

            return this._cccDimList;
        },

        _getGemDimName: function(gem){
            var roleToCccDimMap = this.chart._rolesToCccDimensionsMap,
                cccDimGroup = roleToCccDimMap[gem.role];
            
            if(typeof cccDimGroup === 'string'){
                 return pvc.buildIndexedId(cccDimGroup, gem.roleLevel);
            }
        },
        
        _buildGemHtmlTooltip: function(lines, complex, context, gem, index){
            /*
             * Multi-chart formulas are not shown in the tooltip
             * They're on the small chart's title
             */
            if(this._nonMultiGemFilter(gem)){
                this.base.apply(this, arguments);
            }
        },
        
        _getAxisLabelGems: function(){
            return def.query(this.gems).where(this._nonMultiGemFilter, this);
        },
        
        fillCellSelection: function(selection, complex, selectionExcludesMulti){
            var forms  = [],
                values = [],
                label;
            
            this.getSelectionGems(selectionExcludesMulti)
                .each(function(gem){
                    var atom = complex.atoms[gem.cccDimName];
                    forms.push(gem.formula);
                    values.push(atom.value);
                    label = atom.label; // TODO is this ok?
                });
            
            if(forms.length){
                var axisId = this.id;
                // Dummy property, just to force Analyzer to read the axis info
                selection[axisId] = true;
                
                selection[axisId + 'Id'   ] = forms;
                selection[axisId + 'Item' ] = values;
                selection[axisId + 'Label'] = label;
            }
        },
        
        getSelectionGems: function(selectionExcludesMulti){
            if(selectionExcludesMulti == null){
                selectionExcludesMulti = true;
            }
            
            return def.query(this.gems)
                     .where(function(gem, index){
                        return (!selectionExcludesMulti || this._nonMultiGemFilter(gem)) && 
                               !gem.isMeasureDiscrim && 
                               !!gem.cccDimName;
                     }, this);
        },
        
        getKeepOrDrillGems: function(drillGem, selectionExcludesMulti){
            if(selectionExcludesMulti == null){
                selectionExcludesMulti = true;
            }
            
            return def.query(this.gems)
                     .where(function(gem, index){
                        return gem === drillGem ||
                               ((!selectionExcludesMulti || this._nonMultiGemFilter(gem)) && 
                                !gem.isMeasureDiscrim && 
                                !!gem.cccDimName);
                     }, this);
        },
        
        selectGemsWithLink: function(linkType, complex, reverse){
            var gems = def.query(this.gems);
            if(reverse){
               gems = gems.reverse(); 
            }
            
            var isObjectLinkType = def.object.is(linkType);
            return gems
                .where(function(gem){ 
                    var atom;
                    return gem.hasLink &&
                          (!linkType || (isObjectLinkType ? def.hasOwn(linkType, gem.linkType) : (gem.linkType === linkType))) &&
                          (!complex  || (gem.cccDimName && (atom = complex.atoms[gem.cccDimName]) && atom.value != null));
                })
                ;
        },
        
        selectBoundGems: function(complex, reverse){
            var gems = def.query(this.gems);
            if(reverse){
               gems = gems.reverse(); 
            }
            
            return gems
                .where(function(gem){ 
                    return !gem.isMeasureDiscrim && 
                           gem.cccDimName && 
                           complex.atoms[gem.cccDimName]; 
                 })
                ;
        },
        
        getHyperlinkInfo: function(complex){
            // The last formula of this axis that has a defined hyperlink
            var lastGem = this
                .selectGemsWithLink(this.chart._hyperlinkTypes, complex, /* reverse */ true)
                .first()
                ;

            if(lastGem){
                return {
                    gem:  lastGem,
                    atom: complex.atoms[lastGem.cccDimName]
                };
            }
        },
        
        getDrillDownInfo: function(complex){
            var deepestInfo = this.getDeepestInfo(complex);
            if(!deepestInfo){
                return null;
            }
            
            // Get the child formula, if any, in the same hierarchy
            var lastForm = deepestInfo.gem.formula,
                childForm = this.chart.getChildFormula(lastForm);
            if(!childForm){
            
                // Let's try the other gems
                var gemList = def.query(this.gems).reverse().array();
                for (var i=1; i < gemList.length; i++) {
                    var g = gemList[i];
                    if (!g.isMeasureDiscrim) {
                        var deepestGem = this.getHierarchyDeepestGem(g.formula),
                        atom;
                        if(deepestGem){
                            if(complex){
                                atom = complex.atoms[deepestGem.cccDimName];
                                if(!atom || atom.value == null){
                                    deepestInfo =  null;
                                }
                            }

                            deepestInfo =  {
                                gem:  deepestGem,
                                atom: atom
                            };
                        }                    
                    }
                
                    lastForm = deepestInfo.gem.formula;
                    childForm = this.chart.getChildFormula(lastForm);
                    if (childForm)
                        break;                
                }
    
                if (!childForm)
                    return null;
            }

            /*
             * If the formula is already included in the chart
             * (surely in a different axis) then no drilling
             * (in this axis) is possible.
             */
            if(def.hasOwn(this.chart.gemsMap, childForm)){
                return null;
            }

            deepestInfo.drillChild = childForm;
            
            return deepestInfo;
        },

        getDeepestInfo: function(complex, hierarchy){
            if(this.depth){
                var lastGem = this.getLastProperGem(complex, hierarchy);
                if(lastGem) {
                    var deepestGem = this.getHierarchyDeepestGem(lastGem.formula),
                        atom;
                    if(deepestGem){
                        if(complex){
                            atom = complex.atoms[deepestGem.cccDimName];
                            if(!atom || atom.value == null){
                                return null;
                            }
                        }

                        return {
                            gem:  deepestGem,
                            atom: atom
                        };
                    }
                }
            }

            return null;
        },

        getLastProperGem: function(complex, hierarchy){
            /* Get the last gem that is not a measure discrim.
             * Optionally filter by the given hierarchy argument.
             */

            /*
             * NOTE: there's a "problem" with cv.getFieldHelp().getHierarchy:
             * it must receive a formula of a hierarchy, and not the hierarchy itself.
             *
             * Because of that and the use scenarios of this method,
             * the received argument 'hierarchy' may end up being a formula.
             * We guard against that extracting the hierarchy of it
             * so that the hierarchy comparison  does not fail.
             */
            var realHierarchy;
            if(hierarchy){
                realHierarchy = hierarchy.match(/^(\[.*?\])?.*$/)[1];
            }

            return def.query(this.gems)
                        .reverse()
                        .first(function(gem){
                            var atom;
                            return !gem.isMeasureDiscrim &&
                                   (!realHierarchy || gem.hierarchy === realHierarchy) &&
                                   (!complex || (gem.cccDimName && (atom = complex.atoms[gem.cccDimName]) && atom.value != null));
                        });
        },

        getHierarchyDeepestGem: function(hierarchy){
            var hForms = this.chart._getHierarchyFormulas(
                                    hierarchy,
                                    /*includeHidden*/false,
                                    /*excludeChildren*/false);

            return def.query(hForms)
                      .reverse() // deepest first
                      .select(function(hForm){
                          var gem = def.getOwn(this.chart.gemsMap, hForm);
                          return gem && gem.axis === this && gem.cccDimName ? gem : null;
                      }, this)
                      .first(def.notNully) || null;
        }
    });
    
    // --------------------------

    def
    .type('pentaho.ccc.ColumnAxis', pentaho.ccc.DiscreteAxis)
    .init(function(chart){

        var rolesToCccDimMap = chart._rolesToCccDimensionsMap;

        this.hasMeasureDiscrim = !chart.options.dataOptions.measuresInColumns &&
                                 !!(rolesToCccDimMap[this.defaultRole] ||
                                    rolesToCccDimMap[chart.axes.row.defaultRole]);

        this.isHiddenMeasureDiscrim = this.hasMeasureDiscrim &&
                                      !(chart.axes.measure.genericMeasuresCount > 1);

        this.base(chart, 'column');

        this._ensureRole(this.defaultRole);

        this.realDepth = this.hasMeasureDiscrim ? (this.depth - 1) : this.depth;
    })
    .add({
        defaultRole: 'columns',
        hiddenMeasureDiscrimDimName: 'measureDiscrim',
        measureDiscrimName: null,

        /* Note this is called during base constructor. */
        _getGems: function(){
            var gems = this.base();

            if(this.hasMeasureDiscrim){
                gems.push({
                    isMeasureDiscrim: true,
                    id:    '__MeasureDiscrim__',
                    label: "Measure discriminator",
                    axis:  this.id,
                    role:  this.defaultRole
                });
            }

            return gems;
        },

        _getGemDimName: function(gem){
            if(gem.isMeasureDiscrim && this.isHiddenMeasureDiscrim){
                // When the measure discriminator should not be seen
                // it should be mapped to a different and hidden dimension group
                return this.measureDiscrimName = this.hiddenMeasureDiscrimDimName;
            }

            var cccDimName = this.base(gem);
            if(gem.isMeasureDiscrim){
                if(!cccDimName){
                    // columns role is not mapped to CCC...
                    // In this case, the discriminator goes as the last *row* dimension.
                    // Is the case, at least, in the PieChart, in which there is no "series" concept.
                    var rolesToCccDimMap = this.chart._rolesToCccDimensionsMap,
                        rowAxis          = this.chart.axes.row,
                        rowRole          = rowAxis.defaultRole,
                        rowCccDimGroup   = rolesToCccDimMap[rowRole],
                        rowNextLevel     = rowAxis.gemsByRole[rowRole].length;

                    cccDimName = pvc.buildIndexedId(rowCccDimGroup, rowNextLevel);
                }

                this.measureDiscrimName = cccDimName;
            }
            
            return cccDimName;
        },

        configureDimensionGroups: function(){

            this.base();

            // Ensure measureDiscrimName is determined
            this.cccDimList();
            
            if(this.measureDiscrimName){
                this.chart.options.dimensions[this.measureDiscrimName] = {
                    isHidden: true
                };
            }
        }
    });

    // --------------------------

    def
    .type('pentaho.ccc.RowAxis', pentaho.ccc.DiscreteAxis)
    .init(function(chart){
        
        this.base(chart, 'row');

        this._ensureRole(this.defaultRole);
    })
    .add({
        defaultRole: 'rows'
    });
    
    // --------------------------

    def
    .type('pentaho.ccc.MeasureAxis', pentaho.ccc.Axis)
    .init(function(chart){
        
        this.base(chart, 'measure');
        
        this._ensureRole(this.defaultRole);
        
        this.genericMeasuresCount = 0;
        this.genericMeasureRoles = {};
        def.eachOwn(this.gemsByRole, function(gems, role){
            if(role.indexOf('measures') === 0){
                this.genericMeasureRoles[role] = true;
                this.genericMeasuresCount += gems.length;
            }
        }, this);
    })
    .add({
        defaultRole: 'measures',

        /**
         * Filters the report definition formulas
         * excluding those not returned in the data table.
         *
         * Note this is called during base constructor.
         */
        _getGems: function(){

            var gems = this.base();
            
            var filtered = [];
            
            gems.forEach(function(gem){
                var meaId = gem.id,
                    measureInfo;
                
                if(meaId && (measureInfo = def.getOwn(this.chart._measuresInfo, meaId))){
                    gem.role = measureInfo.role;

                    filtered.push(gem);
                }
            }, this);
            
            return filtered;
        },

        cccDimList: function(){
            if(!this._cccDimList){
                this._cccDimList =
                    this.chart._measureRolesInfoList
                        .map(function(role){ return role.cccDimName; });
            }

            return this._cccDimList;
        },

        _buildGemHtmlTooltip: function(lines, complex, context, gem/*, index*/){

            /*
             * When using measure discriminator column,
             * only the "active" measure in 'complex'
             * is placed in the tooltip.
             */
            var colAxis = this.chart.axes.column;
            if(colAxis.measureDiscrimName    &&
               def.hasOwn(this.genericMeasureRoles, gem.role) &&
               gem.id !== complex.atoms[colAxis.measureDiscrimName].value) {
               return;
            }

            /* Obtain the dimension assigned to the role */
            var cccDimName = this.chart._measureRolesInfo[gem.role].cccDimName;
            if(cccDimName){
                var atom = complex.atoms[cccDimName];
                if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)){
                    // ex: "GemLabel (RoleDesc): 200 (10%)"
                    var tooltipLine = def.html.escape(gem.label);

                    // Role description
                    if(this.chart._noRoleInTooltipMeasureRoles[gem.role] !== true) {
                        tooltipLine += " (" + def.html.escape(gem.role) + ")";
                    }

                    tooltipLine += ": " + def.html.escape(atom.label);

                    if(!this.chart._noPercentInTootltipForPercentGems || gem.measureType !== 'PCTOF'){
                        var valuePct = this._getAtomPercent(atom, context);
                        if(valuePct != null){
                            tooltipLine += " (" + def.html.escape(''+valuePct) + "%)";
                        }
                    }
                    
                    var suffix;
                    if(complex.isInterpolated){
                        suffix = this.chart._message('chartTooltipGemInterp_' + complex.interpolation);
                    } else if(complex.isTrend/* && atom.label*/){
                        // TODO: "atom.label" -- is a weak test for trended measures, 
                        // that relies on the fact that non-trended measures are left null
                        suffix = "(" + this.chart.options.trendLabel + ")"; //this.chart._message('chartTooltipGemTrend_' + complex.trendType);
                    }
                    
                    if(suffix){
                        tooltipLine += " " + suffix;
                    }
                    
                    lines.push(tooltipLine);
                }
            }
        },
        
        _getAtomPercent: function(atom, context){
            if(context) {
                var cccChart = context.chart,
                    data = cccChart.data,
                    playingPercentMap = data.type.getPlayingPercentVisualRoleDimensionMap(),
                    cccDimName = atom.dimension.name
                    ;

                if(playingPercentMap.has(cccDimName)){
                    var group = context.scene.group,
                        pct;
                    if(group) {
                        pct = group.dimensions(cccDimName)
                                   .percentOverParent({ visible: true });
                    } else {
                        pct = data.dimensions(cccDimName).percent(atom.value);
                    }

                    return cccChart.options.valueFormat.call(null, Math.round(pct * 10000) / 100);
                }
            }
        },

        fillCellSelection: function(selection, complex/*, selectionExcludesMulti*/){
            /*
             * Add a description of the selected values.
             * At the time of writing, analyzer discards selection.value
             */
            selection.value = def.query(this.gems)
                .select(function(gem){
                    var cccDimName = this.chart._measureRolesInfo[gem.role].cccDimName;
                    if(cccDimName){
                        return complex.atoms[cccDimName].label;
                    }
                }, this)
                .where(def.truthy)
                .array()
                .join(" ~ ")
                ;
        }
    });

    // ------------------
    
    var installCccEventsShield;
    if(pv.renderer() === 'vml') {
        /*
         * Unhandled mouse events from protovis
         * bubble up and cause slowing down the UI.
         * So, we stop propagation of mouse events. 
         * We can't use dojo or jQuery for this, 
         * cause they try to "fix" the event object, 
         * which is generally an expensive operation
         * that would defeat the initial purpose.
         * An unwanted side effect is that dragging 
         * gems over the chart does not work.
         */
        var _cccEventsShieldEvents =  ['mouseover', 'mouseout', 'mousemove'];
        
        installCccEventsShield = function (element){
            if(!element._cccEventsShield){
                element._cccEventsShield = true;
                
                _cccEventsShieldEvents.forEach(function(evName){
                    addListener(element, evName, stopEventPropagation);
                });
            }
        };
        
        var stopEventPropagation = function (ev){
            if(!ev){ ev = window.event; }
            if(ev.stopPropagation) {
                ev.stopPropagation();
            } else {
                ev.cancelBubble = true;
            }
        };
        
        var addListener = function (elem, type, listener){
            elem.addEventListener
                ? elem.addEventListener(type, listener, false)
                : elem.attachEvent("on" + type, listener);
        };
    }
    
    
    /* CCC Charts Options */
    var ruleStrokeStyle = "#808285";  // #D8D8D8',  // #f0f0f0
    var lineStrokeStyle = "#D1D3D4";  // "#D1D3D4"; //'#A0A0A0'; // #D8D8D8',// #f0f0f0
       
    function legendShapeColorProp(scene){
       var color = scene.color;
       return scene.isOn() ? color : pvc.toGrayScale(color);
    }
       
    var baseOptions = {
        /* Chart */
        compatVersion: 2, // use CCCv2
        
        margins:  0,
        paddings: 10,
        plotFrameVisible: false,
        
        /* Multichart */
        multiChartMax: 50,
    
        /* Legend */
        legend:  true,
        legendPosition:  'right',
        legendSizeMax:   '60%',
        legendPaddings:  10,
        legendItemPadding: {left: 1, right: 1, top: 2, bottom: 2},// width: 2, height: 4
        legendClickMode: 'toggleSelected',
        color2AxisLegendClickMode: 'toggleSelected', // for data part 2 (lines in column/line combo)
        color3AxisLegendClickMode: 'toggleSelected', // for trends
        
        /* Axes */
        axisSizeMax:      '50%',
        axisTitleSizeMax: '20%',
        orthoAxisGrid: true,
        
        /* Continuous axes */
        continuousAxisLabelSpacingMin: 1.1, // em
        
        /* Title */
        titlePosition: 'top',

        /* Interactivity */
        interactive:    true,
        animate:        false,
        tooltipEnabled: true,
        clickable:      true,
        selectable:     true,
        hoverable:      false,
        ctrlSelectMode: false,
        clearSelectionMode: 'manual',
        
        /* Plot */
        valuesVisible:  false,
        
        ignoreNulls:   false,
        groupedLabelSep: "~",
        
        crosstabMode:  true,
        isMultiValued: true,
        seriesInRows:  false,
        dataOptions: {
            //categoriesCount:   1, set in code
            measuresInColumns: true
        },
        
        extensionPoints: {
            axisRule_strokeStyle:   ruleStrokeStyle,
            axisTicks_strokeStyle:  lineStrokeStyle,
            dot_lineWidth: 1.5,
            legendArea_lineWidth:       1,
            legendArea_strokeStyle:     '#c0c0c0',
            legendLabel_textDecoration: null,
            legendDot_fillStyle:    legendShapeColorProp,
            legendDot_strokeStyle:  legendShapeColorProp,
            legend2Dot_fillStyle:   legendShapeColorProp,
            legend2Dot_strokeStyle: legendShapeColorProp
        },
        
        tooltip: {
            delayIn:      200,
            delayOut:     80,
            offset:       2,
            html:         true,
            gravity:      'nw',
            fade:         false,
            followMouse:  true,
            useCorners:   true,
            arrowVisible: false,
            opacity:      1
        }
    };
    
    var mixinDiscreteXOptions = {
        extensionPoints: {
            xAxisLabel_textAngle:    -Math.PI/4,
            xAxisLabel_textAlign:    'right',
            xAxisLabel_textBaseline: 'top'
        }
    };
    
    // ------------------
    
    def
    .type('pentaho.ccc.Chart')
    .init(function(element){
        this._element = element;
        this._elementName = element.id;
        
        if(installCccEventsShield) { installCccEventsShield(element); }
    })
    .add({
        _options: baseOptions,
        
        _rolesToCccDimensionsMap: {
            'columns':  'series',
            'rows':     'category',
            'multi':    'multiChart',
            'measures': 'value'
        },
        
        _keyAxesIds: ['column', 'row'],
        _axesIds:    ['column', 'row', 'measure'],

        /* This takes creation time dependencies into account.
         * It works right now. If it doesn't scale,
         * then some parts of axes initialization must me taken out
         * of the axes class or split into more initialization phases.
         */
        _axesCreateOrderIds: ['row', 'measure', 'column'],

        /* This is the order in which fields
         * are laid out in the CCC's virtual item.
         * Indexes of readers are relative to this layout.
         */
        _cccVirtualItemAxesLayout: ['column', 'row', 'measure'],
      
        /* The drilling axes.
         *
         * In the order to be tested
         * for being chosen as the drilling axis.
         */
        _drillAxesIds: ['column', 'row'],
        
        /* The linking axes.
        *
        * In the order to be tested
        * for being chosen as the link axis.
        */
        _linkAxesIds: ['column', 'row'],
        
        /* Measure roles that do not show the role in the tooltip.
         */
        _noRoleInTooltipMeasureRoles: {'measures': true},

        /* Do not show percent in front of an analyzer "percent measure" gem.
         */
        _noPercentInTootltipForPercentGems: false,
        
        _multiRole: 'multi',
        
        _discreteColorRole: 'columns',
        
        /* PLUGIN INTERFACE  */

        /**
         * Instructs the visualization to draw itself with
         * supplied data and options.
         */
        draw: function(dataTable, vizOptions){
            // CDA table
            this._metadata  = [];
            this._resultset = null;
            
            // Pentaho/Google data table
            this._dataTable = dataTable;
            
            /* TEST
            if(!vizOptions.memberPalette){
                vizOptions.memberPalette = {
                    "[Markets].[Territory]": {
                        "[Markets].[APAC]":   "red",
                        "[Markets].[EMEA]":   "green",
                        "[Markets].[Japan]":  "blue",
                        "[Markets].[NA]":     "pink"
                    },
                    
                    "[Measures].[MeasuresLevel]": {
                        "[MEASURE:0]": "violet",
                        "[MEASURE:1]": "orange"
                    }
                };
            }
            */
            
            // ---------------
            
            this._initOptions(vizOptions);
            
            this._processDataTable();
            
            this._initAxes();

            // ---------------

            var rowDepth = this.axes.row.depth;
            this.options.dataOptions.categoriesCount = rowDepth;

            this._hasMultiChartColumns = this.axes.row.hasMulti || this.axes.column.hasMulti;

            // ---------------
            
            this._readUserOptions(this.options, vizOptions);
            
            // ---------------
            
            this._readData();

            this._configure();
            
            this._prepareLayout(this.options);
            
            this._render();
        },

        resize: function(width, height){
            // Resize event throttling
            
            if(this._lastResizeTimeout != null){
                clearTimeout(this._lastResizeTimeout);
            }
            
            this._lastResizeTimeout = setTimeout(function(){
                this._lastResizeTimeout = null;
                
                this._doResize(width, height);
                
            }.bind(this), 50);
        },
        
        _doResize: function(width, height){
            if(this._chart){
                var options = this._chart.options; 
                
                def.set(options, 'width', width, 'height', height);
                
                this._prepareLayout(options);
                
                this._chart.render(true, true, false);
            }
        },
        
        /* Sets the items on the chart that should be highlighted */
        setHighlights: function(selections) {
            this._selections = selections;
            
            if(!this._ownChange){ // reentry control
                if(!selections || selections.length == 0){
                    // will cause selectionChangedAction being called
                    this._ownChange = true;
                    try {
                        this._chart.clearSelections();
                    } finally {
                        this._ownChange = false;
                    }
                }
            }
        },

        // TODO: what's this for? Column/Bar?
        /* Returns the output parameters of the chart. */
        getOutputParameters: function() {
            var params = [];
            if (this._cccClass == 'pvc.PieChart') {
                params.push([
                        this._dataTable.getColumnId( 0 ),
                        true,
                        this._dataTable.getColumnId( 0 )
                    ]);
            } else {
                for(var j = 0 ; j < this._dataTable.getNumberOfColumns() ; j++) {
                    params.push([
                            this._dataTable.getColumnId(j),
                            true,
                            this._dataTable.getColumnId(j)
                        ]);
                }
            }

            return params;
        },

        /* HELPERS  */

        _initOptions: function(vizOptions){
            // Make a copy
            vizOptions = this._vizOptions = $.extend({}, vizOptions);

            this._vizHelper = cv.pentahoVisualizationHelpers[vizOptions.customChartType];
            
            this._hasContentLink = this._vizHelper.isInteractionEnabled() && 
                                   this._vizHelper.hasContentLink();

            // Store the current selections
            this._selections = vizOptions.selections;
            
            // Recursively inherit this class' shared options
            var options = this.options = def.create(this._options);
            def.set(
                options,
                'canvas',          this._elementName,
                'height',          vizOptions.height || 400,
                'width',           vizOptions.width  || 400,
                'dimensionGroups', {},
                'dimensions',      {},
                'visualRoles',     {},
                'readers',         [], 
                'calculations',    []);
        },
       
        _message: function(msgId, args) { return this._vizHelper.message(msgId, args); },
        
        _setNullInterpolationMode: function(options, value){ },
        
        _readUserOptions: function(options, vizOptions){
            // Apply vizOptions to extension points and others
            var extPoints = options.extensionPoints;
            
            var value = vizOptions.backgroundFill;
            if(value && value !== 'NONE'){
                var fillStyle;
                if(value === 'GRADIENT'){
                    if(this._hasMultiChartColumns){
                        // Use the first color with half of the saturation
                        var bgColor = pv.color(vizOptions.backgroundColor).rgb();
                        bgColor = pv.rgb(
                                ~~((255 + bgColor.r) / 2), // ~~ <=> Math.floor
                                ~~((255 + bgColor.g) / 2),
                                ~~((255 + bgColor.b) / 2),
                                bgColor.a);
                        
                        fillStyle = bgColor;
                    } else {
                        fillStyle = 'linear-gradient(to top, ' + 
                                    vizOptions.backgroundColor + ', ' + 
                                    vizOptions.backgroundColorEnd + ')';
                    }
                } else {
                    fillStyle = vizOptions.backgroundColor;
                }
                
                extPoints.base_fillStyle = fillStyle;
            }
            
            value = vizOptions.labelColor;
            if(value !== undefined){
                extPoints.axisLabel_textStyle =  
                extPoints.axisTitleLabel_textStyle = value;
            }
            
            value = ('' + vizOptions.showLegend) === 'true';
            options.legend = value;
            if(value){
                value = vizOptions.legendColor;
                if(value !== undefined){
                    extPoints.legendLabel_textStyle = value;
                }
                
                // TODO: ignoring white color cause analyzer has no on-off for the legend bg color
                // and always send white. When the chart bg color is active it
                // would not show through the legend.
                value = vizOptions.legendBackgroundColor;
                if(value && value.toLowerCase() !== "#ffffff"){
                    extPoints.legendArea_fillStyle = value;
                }
                
                value = vizOptions.legendPosition;
                if(value){
                    options.legendPosition = value.toLowerCase();
                }
                
                
                if(vizOptions.legendSize){
                    options.legendFont = readFont(vizOptions, 'legend');
                }
            }
            
            value = vizOptions.lineWidth;
            if(value !== undefined){
                extPoints.line_lineWidth  = +value;      // + -> to number
                var radius = 3 + 6 * ((+value) / 8); // 1 -> 8 => 3 -> 9,
                extPoints.dot_shapeSize = radius * radius;
                
                extPoints.plot2Line_lineWidth = extPoints.line_lineWidth; 
                extPoints.plot2Dot_shapeSize  = extPoints.dot_shapeSize;
            }
            
            value = vizOptions.maxChartsPerRow;
            if(value !== undefined){
                options.multiChartColumnsMax = +value; // + -> to number
            }
            
            value = vizOptions.emptyCellMode;
            if(value){
                switch(value){
                    case 'GAP':    value = 'none';   break;
                    case 'ZERO':   value = 'zero';   break;
                    case 'LINEAR': value = 'linear'; break;
                }
                
                this._setNullInterpolationMode(options, value);
            }
            
            value = vizOptions.multiChartRangeScope;
            if(value){
                switch(value){
                    case 'GLOBAL': value = 'global'; break;
                    case 'CELL':   value = 'cell';   break;
                }
                
                options.numericAxisDomainScope = value;
            }
            
            // build style for pv
            if (vizOptions.labelSize){
                var labelFont = readFont(vizOptions, 'label');
                
                options.axisTitleFont = 
                options.axisFont = labelFont;
                
                if(this._hasMultiChartColumns){
                    var labelFontSize   = readFontSize(vizOptions, 'label');
                    var labelFontFamily = readFontFamily(vizOptions, 'label');
                    options.titleFont = (labelFontSize + 2) + "px " + labelFontFamily;
                }
            }
            
            var sizeByNegativesMode = vizOptions.sizeByNegativesMode;
            options.sizeAxisUseAbs = sizeByNegativesMode === 'USE_ABS';
        },
        
        _processDataTable: function(){
            // Data truncation can affect also the structure of data.
            // If the query returns more than 100x100 rowsxcols,
            // requested measure formulas may be suppressed.
            // Filter measures not returned in this._dataTable
            //
            // Note that there is no guarantee that
            // when a given measure is not present with a given col value
            // it will not show up in the next col value
            // When no row has a value in a given column, the column is omitted...
            //
            // Note that measure gems that are in no *chart* gem bar (not mapped)
            // and that do not have hideInChart=true may appear here as columns.
            // These are ignored (meaRole === 'undefined').
            // 
            // Measure columns of the same col values group may come in any order...
            // and even in different orders across column groups.

            var dataTable = this._dataTable;
            var dtColCount = dataTable.getNumberOfColumns();
            var roleToCccDimMap = this._rolesToCccDimensionsMap;
            var colGroups = [];
            var colGroupsByColValues = {};

            /* 
             * meaRoleId -> {
             *   groupIndex: 0, // Global order of measure roles within a column group
             *   index: 0       // Column index of a measure role's first appearance
             * }
             */
            var measureRolesInfo     = {};
            var measureRolesInfoList = [];
            
            /*
             * id -> { gem info }
             */
            var measuresInfo = {};
            var measuresInfoList = [];
                        
            var rowsInfoList = [];
            var columnsInfoList = [];
            
            var tc = 0;
            var colId, splitColId;
            
            /*
             * I - Row gems
             */
            while(tc < dtColCount){
                colId = dataTable.getColumnId(tc);
                splitColId = splitColGroupAndMeasure(colId);
                
                if(!processRowColumn.apply(this, splitColId)){
                    // Found first measure column
                    break;
                }
                
                // next
                tc++;
            }
            
            // First measure column
            if(tc < dtColCount){
                
                /*
                 * II - Column gems
                 * 
                 * Collects column gems' roles from the first col~mea column.
                 */
                processColumnsInfo.call(this, splitColId[0]);
                
                /*
                 * III - Row gems
                 */
                while(true){
                    processMeasureColumn.apply(this, splitColId);
                    
                    // next
                    if(++tc >= dtColCount){
                        break;
                    }
                    
                    colId = dataTable.getColumnId(tc);
                    splitColId = splitColGroupAndMeasure(colId);
                }
            }
            
            // Sort measure roles
            measureRolesInfoList.sort(function(infoa, infob){
                return def.compare(infoa.groupIndex, infob.groupIndex) ||
                       def.compare(infoa.index,      infob.index) // tie breaker
                ;
            });

            // Reassign role group indexes
            measureRolesInfoList.forEach(function(roleInfo, index){
                roleInfo.groupIndex = index;
            });

            // Publish
            this._measureRolesInfo = measureRolesInfo;
            this._measureRolesInfoList = measureRolesInfoList;
            this._colGroups = colGroups;
            this._measuresInfo = measuresInfo;
            
            this._axesGemsInfo = {
                'measure': measuresInfoList,
                'row':     rowsInfoList,
                'column':  columnsInfoList
            };
            
            
            /* HELPER functions */
            
            function processRowColumn(colGroupValues, meaId){
                if(/\[MEASURE:(\d+)\]$/.test(meaId)){
                    // Found the first measure column
                    return false; // It isn't a "row" column
                }
                
                // When "Member properties" are shown in a member gem,
                // additional columns are added to the data table, 
                // that are to be ignored.
                // These columns have no column role.
                // We transform them to 'undefined' role
                // which is the role value that unmapped measure columns
                // already have.
                var rolesAndLevels = getColumnRolesAndLevels(dataTable, tc);
                
                // A row gem
                rowsInfoList.push({
                    id:      colId,
                    formula: colId,
                    label:   dataTable.getColumnLabel(tc),
                    axis:    'row',
                    role:    rolesAndLevels ? rolesAndLevels[0].id : 'undefined',
                    index:   rowsInfoList.length
                });
                
                return true; // It is a "row" column
            }
            
            // Column Roles are the same in every col~measure column.
            // So we collect them from the first one.
            function processColumnsInfo(colGroupValues){
                if(colGroupValues){
                    var rolesAndLevels = getColumnRolesAndLevels(dataTable, tc);
                    var colValues = colGroupValues.split('~');
                    
                    colValues.forEach(function(colValue, index){
                        var roleAndLevel = rolesAndLevels[index];
                        columnsInfoList.push({
                            id:      roleAndLevel.level,
                            formula: roleAndLevel.level,
                            label:   undefined, // not in data table
                            axis:    'column',
                            role:    roleAndLevel.id,
                            index:   index
                        });
                    });
                }
            }
            
            function processMeasureColumn(colGroupValues, id){
                
                var meaInfo = def.getOwn(measuresInfo, id);
                
                /* New measure? */
                if(!meaInfo){
                    // TODO - last() ?
                    var roleAndLevel = getColumnRolesAndLevels(dataTable, tc).pop();
                    
                    // NOTE: roleAndLevel.level == [Measures].[MeasuresLevel],
                    // which is not the formula...
                    meaInfo = {  
                        id:      id,
                        formula: undefined, // not in data table 
                        label:   splitColGroupAndMeasure(dataTable.getColumnLabel(tc))[1],
                        axis:    'measure',
                        role:    roleAndLevel.id,
                        index:   measuresInfoList.length,
                        isUnmapped: roleAndLevel.id === 'undefined'
                    };
                    
                    measuresInfo[id] = meaInfo;
                    measuresInfoList.push(meaInfo);
                }
                
                /* New column group? */
                var colGroup = def.getOwn(colGroupsByColValues, colGroupValues);
                if(!colGroup){
                    colGroup = {
                        index:      tc,
                        encValues:  colGroupValues,
                        values:     colGroupValues ? colGroupValues.split('~') : [],
                        measureIds: [id]
                    };

                    colGroupsByColValues[colGroupValues] = colGroup;
                    colGroups.push(colGroup);
                } else {
                    colGroup.measureIds.push(id);
                }
                
                /* Role */
                var currMeaIndex = (tc - colGroup.index);
                var meaRoleInfo  = def.getOwn(measureRolesInfo, meaInfo.role);
                if(!meaRoleInfo){
                    meaRoleInfo = {
                        id:         roleAndLevel.id,
                        cccDimName: meaInfo.isUnmapped ?
                                        null :
                                        (roleToCccDimMap[roleAndLevel.id] ||
                                         def.assert("Must map to CCC all measure roles that the data table contains.")),
                        groupIndex: currMeaIndex,
                        index:      tc // first index where role appears (for tie break, see .sort above)
                    };
                    
                    measureRolesInfo[meaInfo.role] = meaRoleInfo;
                    measureRolesInfoList.push(meaRoleInfo);

                } else if(currMeaIndex > meaRoleInfo.groupIndex) {
                    meaRoleInfo.groupIndex = currMeaIndex;
                }
            }
        },
        
        _initAxes: function(){
            /* formula, id -> gem */
            this.gemsMap = {};
        
            /* roleId -> axis */
            this.axisByRole = {};
            
            /* axisId -> Axis */
            this.axes = {};
            
            this._gemCountColumnReportAxis = 0;
            this._measureDiscrimGem = null;
            
            /* Create and configure Axis's */
            this._axesCreateOrderIds.forEach(createAxis, this);

            var virtualItemIndex = 0;
            var cccDimNamesSet = {};
            this._cccVirtualItemAxesLayout.forEach(function(axisId){
                virtualItemIndex = this.axes[axisId].configure(virtualItemIndex, cccDimNamesSet);
            }, this);
            
            /* @instance */
            function createAxis(axisId){

                var axis = pentaho.ccc.Axis.create(this, axisId);

                axis.gems.forEach(indexGem, this);
                
                this.axes[axisId] = axis;
                
                var boundRoleList = axis.boundRolesIdList;
                if(boundRoleList){
                    boundRoleList.forEach(function(roleId){
                        !def.hasOwn(this.axisByRole, roleId) || def.assert("A role cannot be in more than one axis");
                        this.axisByRole[roleId] = axis;
                    }, this);
                }
            }

            /* @instance */
            function indexGem(gem){
                var form = gem.formula,
                    id   = gem.id;

                // NOTE: when interaction is disabled...
                // formula and id aren't available in every axis type...
          
                // Index by formula
                if(form){
                    this.gemsMap[form] = gem;
                }

                if(id && form !== id){
                    this.gemsMap[id] = gem;
                }
                
                if(gem.reportAxis === 'column'){
                    this._gemCountColumnReportAxis++;
                }
                
                if(gem.isMeasureDiscrim){
                    this._measureDiscrimGem = gem;
                }
            }
        },

        _readData: function() { this._readDataCrosstab(); },

        /**
         * Creates a CCC resultset in CROSSTAB format.
         *
         * Data passes through mostly as it comes;
         * it's simply translated to CDA format.
         */
        _readDataCrosstab: function() {
            var dataTable = this._dataTable,
                colCount = dataTable.getNumberOfColumns(),
                rowCount = dataTable.getNumberOfRows();

            // Direct translation
            for(var tc = 0 ; tc < colCount ; tc++){
                this._addCdaMetadata(
                    dataTable.getColumnId(tc),
                    dataTable.getColumnLabel(tc),
                    writeCccColumnDataType(dataTable.getColumnType(tc)));
            }

            var table = this._resultset = new Array(rowCount);
            for(var tr = 0; tr < rowCount; tr++) {
                var row = new Array(colCount);

                for(tc = 0 ; tc < colCount ; tc++){
                    row[tc] = this._getTableCell(tr, tc);
                }

                table[tr] = row;
            }
        },

        _configure: function(){
            var options = this.options;
            var vizOptions = this._vizOptions;
            
            // By default hide overflow, otherwise, 
            // resizing the window frequently ends up needlessly showing scrollbars. 
            // TODO: is it ok to access "vizOptions.controller.domNode" ?
            vizOptions.controller.domNode.style.overflow = 'hidden'; // Hide overflow
            
            var colorScaleKind = this._getColorScaleKind();
            if(colorScaleKind){
                this._configureColor(colorScaleKind);
            }
            
            if((this.options.legend = this._showLegend())) {
                this._configureLegend();
            }

            if(this._hasMultiChartColumns) {
               this._configureMultiChart();
            }
            
            this._configureTrends();
            
            options.axisFont = defaultFont(options.axisFont, 12);
            options.axisTitleFont = defaultFont(options.axisTitleFont, 12);

            if(!this._vizHelper.isInteractionEnabled()){
                options.interactive = false;
            } else {
                if(options.tooltipEnabled){
                    this._configureTooltip();
                }
                
                if((options.selectable = this._canSelect())){
                    this._configureSelection();
                }
                
                this._configureDoubleClick();
            }
        },
        
        _getColorScaleKind: function() { return 'discrete'; },
        
        _configureColor: function(colorScaleKind){
            var options = this.options;
            var vizOptions = this._vizOptions;
            
            switch(colorScaleKind){
                case 'discrete':
                    options.colors = this._getDiscreteColorScale();
                    break;
                    
                case 'continuous':
                    options.colorScaleType = vizOptions.colorScaleType;
                    options.colors = vizOptions.colors;
                    break;
            }
        },
        
        _getDiscreteColorScale: function(){
            var memberPalette = this._vizOptions.memberPalette;
            var colorScale = memberPalette && this._getDiscreteColorScaleCore(memberPalette);
            return colorScale || this._getDefaultDiscreteColorScale();
        },
        
        _getDefaultDiscreteColorScale: function() { return this._vizOptions.palette.colors.slice(); },
        
        _getDiscreteColorScaleCore: function(memberPalette){
            var colorRoleId = this._discreteColorRole;
            if(colorRoleId){
                // 1 - The CCC color role is not being explicitly set, so whatever goes to the series role is used by the color role
                // 2 - When a measure discrim is used and there is only one measure, the CCC dim name of the discriminator is
                //      not of the "series" group; so in this case, there's no discriminator in the key
                
                var colorAxis = this.axisByRole[colorRoleId];
                var colorGems = colorAxis ? // No gems?
                                colorAxis.gemsByRole[colorRoleId].filter(function(gem){ return !gem.isMeasureDiscrim; }) :
                                [];
                        
                var C = colorGems.length;
                var M;
                
                if(this._cccClass == 'pvc.PieChart'){
                    // When multiple measures exist, 
                    // the pie chart shows them as multiple charts
                    // and if these would affect color, 
                    // each small chart would have a single color.
                    M = 0;
                } else {
                    M = this.axes.measure.genericMeasuresCount;
                }
                
                var keyIncludesDiscrim = (M > 1);
                if(C > 0 || M > 0){
                    var colorMap;
                    var lastIndex;
                    // var useMeasureGems = !C || keyIncludesDiscrim;
                    if(M <= 1){
                        if(C > 0){
                            // Use colors
                            colorMap = memberPalette[colorGems[C - 1].formula];
                        } else {
                            // Use measures (M === 1)
                            colorMap = memberPalette['[Measures].[MeasuresLevel]'];
                            var c = colorMap && colorMap[this.axes.measure.gems[0].id];
                            return c ? pv.colors([colorFromAnalyzer(c)]) : null;
                        }
                    } else {
                        // Use measures
                        // keyIncludesDiscrim ; assume discrim is always placed at the end
                        lastIndex = 0;
                        colorMap  = memberPalette['[Measures].[MeasuresLevel]'];
                    }
                    
                    // Is there a color map for the chosen hierarchy?
                    if(colorMap){
                        colorMap = def.query(def.ownKeys(colorMap))
                                      .object({ 
                                        value: function(k) {
                                            return colorFromAnalyzer(colorMap[k]); 
                                        }
                                      });
                        
                        var defaultScale = pv.colors(this._getDefaultDiscreteColorScale());
                        return function(){
                            var scale = function(compKey){
                                if(compKey){
                                    var comps = compKey.split(/\s*,\s*/);
                                    var key   = comps[comps.length - 1];
                                    return colorMap[key] || defaultScale(key);
                                }
                            };
                            
                            def.copy(scale, defaultScale);
                            return scale;
                        };
                    }
                }
            }
        },

        _configureTrends: function(){
            var options = this.options;
            var vizOptions = this._vizOptions;
            
            var trendType = (this._supportsTrends ? vizOptions.trendType : null) || 'none';
            switch(trendType){
                case 'none':
                case 'linear':
                    break;
                default: 
                    trendType = 'none';
            }
            
            options.trendType = trendType;
            if(trendType !== 'none'){
                var trendName = vizOptions.trendName;
                if(!trendName){
                    trendName = this._message('dropZoneLabels_TREND_NAME_' + trendType.toUpperCase());
                }
                
                options.trendLabel = trendName;
                
                var value = vizOptions.trendLineWidth;
                if(value !== undefined){
                    var extPoints = options.extensionPoints;
                    
                    extPoints.trendLine_lineWidth  = +value;      // + -> to number
                    var radius = 3 + 6 * ((+value) / 8); // 1 -> 8 => 3 -> 9,
                    extPoints.trendDot_shapeSize = radius * radius;
                }
            }
        },
        
        _configureMultiChart: function(){
            var options = this.options;

            // Let the vertical scrollbar show up if necessary
            var containerStyle = this._vizOptions.controller.domNode.style;
            containerStyle.overflowX = 'hidden';
            containerStyle.overflowY = 'auto';
            
            // Very small charts can't be dominated by text...
            //options.axisSizeMax = '30%';
            
            var titleFont = defaultFont(options.titleFont, 12);
            if(titleFont && !(/black|(\bbold\b)/i).test(titleFont)){
                titleFont = "bold " + titleFont;
            }
            
            options.smallTitleFont = titleFont;

            var multiChartOverflow = this._vizOptions.multiChartOverflow;
            if(multiChartOverflow) {
                options.multiChartOverflow = multiChartOverflow.toLowerCase();
            }
        },

        _configureTooltip: function(){
            var me = this;
            this.options.tooltipFormat = function(scene){
                return me._getTooltipText(scene.datum, this);
            };
        },

        _canSelect: function(){
            if(!this.options.selectable){
                return false;
            }
            
            // Selection is disabled if 2 or more reportAxis='column' gems exist
            if(this._gemCountColumnReportAxis >= 2){
                return false;
            }
            
            return true;
        },
        
        _configureSelection: function(){
            var me = this;
            this.options.userSelectionAction = function(cccSelections){
                return me._onUserSelection(cccSelections);
            };
            this.options.selectionChangedAction = function(cccSelections){
                me._onSelectionChanged(cccSelections);
            };
        },

        _configureDoubleClick: function(){
            var me = this;
            this.options.doubleClickAction = function(scene){
                me._onDoubleClick(scene.datum);
            };

            this.options.axisDoubleClickAction = function(scene) {
                var group = scene.group;
                if(group){
                    return me._onDoubleClick(group);
                }
            };
        },
        
        _showLegend: function(){
            if(!this.options.legend){
                return false;
            }
            
            if(this.axes.measure.genericMeasuresCount > 1){
                return true;
            }

            var colAxis = this.axes.column,
                cccColDimGroup = this._rolesToCccDimensionsMap[colAxis.defaultRole];

            if(!cccColDimGroup || colAxis.realDepth > 0){
                return true;
            }
            
            return false;
        },

        _configureLegend: function(){
            var options = this.options;

            options.legendFont = defaultFont(options.legendFont, 10);
            
            var legendPosition = options.legendPosition,
                isTopOrBottom = legendPosition === 'top' || legendPosition === 'bottom';
            
            if(this._hasMultiChartColumns && !isTopOrBottom){
                options.legendAlignTo  = 'page-middle';
                options.legendKeepInBounds = true; // ensure it is not placed off-page
                
                // Ensure that legend margins is an object.
                // Preseve already specifed margins.
                // CCC's default adds a left or right 5 px margin,
                // to separate the legend from the content area.
                var legendMargins = options.legendMargins;
                if(legendMargins){
                    if(typeof(legendMargins) !== 'object'){
                        legendMargins = options.legendMargins = {all: legendMargins};
                    }
                } else {
                    legendMargins = options.legendMargins = {};
                    var oppositeSide = pvc.BasePanel.oppositeAnchor[legendPosition];
                    legendMargins[oppositeSide] = 5;
                }
                
                legendMargins.top = 20;
            } 
            
            if(!('legendAlign' in options)){
                // Calculate 'legendAlign' default value
                if(isTopOrBottom){
                    options.legendAlign = 'center';
                } else {
                    options.legendAlign = 'middle';
                }
            }
        },
        
        // Logic that depends on width and height
        _prepareLayout: function(options){
            if(this._hasMultiChartColumns && pv.renderer() !== 'batik'){
                // Account for the width of the *possible* scrollbar
                options.width -= 17;
            }
        },
    
        _render: function(){
            while(this._element.firstChild) {
                this._element.removeChild(this._element.firstChild);
            }

            var chartClass = def.getPath({pvc: pvc}, this._cccClass);
            
            this._chart = new chartClass(this.options);
            this._chart.setData({
                metadata:  this._metadata,
                resultset: this._resultset
            });
            
            this._chart.render();
        },

        /* INTERACTIVE - TOOLTIPS */

        _getTooltipText: function(complex, context){
            var tooltipLines = [];

            this._axesIds.forEach(function(axisId){
                this.axes[axisId].buildHtmlTooltip(tooltipLines, complex, context);
            }, this);
            
            if(!complex.isVirtual){ 
                if(this._hasContentLink){
                    /* Add content link information to the tooltip. */
                    msg = this._message('chartTooltipFooterContentlink');
                    
                    tooltipLines.push(msg);
                } else {
                    /* Add hyperlink information to the tooltip. */
                    var hyperlinkInfo = this._getHyperlinkInfo(complex);
                    var msg;
                    if(hyperlinkInfo){
                        msg = this._message(
                                'chartTooltipFooterHyperlink', [
                                    def.html.escape(hyperlinkInfo.gem.linkLabel || this._message('chartTooltipHyperlinkDefaultTitle'))
                                ]);
                        
                        tooltipLines.push(msg);
                    } else {
                        
                        /* Add drill-down information to the tooltip. */
                        var drillDownInfo = this._getDrillDownInfo(complex);
                        if(drillDownInfo){
                            msg = this._message(
                                        'chartTooltipFooterDrillDown', [
                                            def.html.escape(this._vizHelper.getFormulaLabel(drillDownInfo.drillChild))
                                         ]);
                            
                            tooltipLines.push(msg);
                        }
                    }
                }
            }
            
            /* Add selection information */
            // Not the data point count, but the selection count (a single column selection may select many data points).
            //var selectedCount = this._chart && this._chart.data.selectedCount();
            var selections = this._vizOptions.controller.highlights;
            var selectedCount = selections && selections.length;
            if(selectedCount){
                var msgId = selectedCount === 1 ? 
                            'chartTooltipFooterSelectedSingle' : 
                            'chartTooltipFooterSelectedMany';
                
                msg = this._message(msgId, [selectedCount]);
                
                tooltipLines.push(msg);
            }
            
            return tooltipLines.join('<br />');
        },

        /* INTERACTIVE - SELECTION */
        
        _onUserSelection: function(selectingDatums){
            return this._processSelection(selectingDatums);
        },
        
        _getSelectionKey: function(selection){
            var key = selection.__cccKey;
            if(!key){
                var keys = [selection.type];
                
                var ap = def.array.append;
                if(selection.columnId){
                    ap(keys, selection.columnId);
                    ap(keys, selection.columnItem);
                }
                
                if(selection.rowId){
                    ap(keys, selection.rowId);
                    ap(keys, selection.rowItem);
                }
                
                key = selection.__cccKey = keys.join('||');
            }
            
            return key;
        },
        
        _doesSharedSeriesSelection: function(){
            return (this._gemCountColumnReportAxis === 1);
        },
        
        _onSelectionChanged: function(selectedDatums){
            
            if(!this.options.selectable){
                return;
            }
            
            // Convert to array of analyzer cell or column selection objects
            var selectionExcludesMulti = this._selectionExcludesMultiGems();
            
            var selections = [];
            var selectionsByKey = {};
            
            if(this._doesSharedSeriesSelection()){
                selectedDatums.forEach(function(datum){
                    if(!datum.isVirtual){
                        var selection = { type: 'column' };
                        
                        this.axes.column.fillCellSelection(selection, datum, selectionExcludesMulti);
                        
                        // Check if there's already a selection with the same key.
                        // If not, add a new selection to the selections list.
                        // In the case where the selection max count limit is reached, 
                        // the datums included in each selection must be known (by its index).
                        // So, add the datum to the new or existing selection's datums list.
                        
                        var key = this._getSelectionKey(selection);
                        
                        var existingSelection = selectionsByKey[key];
                        if(!existingSelection){
                            selection.__cccDatums = [datum];
                            
                            selectionsByKey[key] = selection;
                            selections.push(selection);
                        } else {
                            existingSelection.__cccDatums.push(datum);
                        }
                    }
                }, this);
                
            } else {
                // Duplicates may occur due to excluded dimensions like the discriminator
                selectedDatums.forEach(function(datum){
                    if(!datum.isVirtual){
                        var selection = this._complexToCellSelection(datum, selectionExcludesMulti);
                        
                        // Check if there's already a selection with the same key.
                        // If not, add a new selection to the selections list.
                        var key = this._getSelectionKey(selection);
                        var existingSelection = selectionsByKey[key];
                        if(!existingSelection){
                            selection.__cccDatums = datum;
                            
                            selectionsByKey[key] = selection;
                            selections.push(selection);
                        }
                    }
                }, this);
            }
            
            selections = this._limitSelection(selections);
            
            // Wrap the event trigger with _ownChange=true, 
            // cause otherwise, when the #setHighlights method is called,
            // in response to selection changing,
            // and if only interpolated dots had beed selected,
            // resulting in selections.length === 0,
            // then the chart selections would be reset...
            this._ownChange = true;
            try {
                // Launch analyzer select event, even if selection is empty (to clear it)
                pentaho.events.trigger(this, "select", {
                    source:        this,
                    selections:    selections,
                    selectionMode: "REPLACE"
                });
            } finally {
                this._ownChange = false;
            }
        },
        
        _limitSelection: function(selections){
            // limit selection
            var filterSelectionMaxCount = this._vizOptions['filter.selection.max.count'] || 200;
            var selections2 = selections;
            var L = selections.length;
            var deselectCount = L - filterSelectionMaxCount;
            if(deselectCount > 0) {
                // Build a list of datums to deselect
                var deselectDatums = [];
                selections2 = [];
                
                for(var i = 0 ; i < L ; i++){
                    var selection = selections[i];
                    var keep = true;
                    if(deselectCount){
                        if(this._previousSelectionKeys){
                            var key = this._getSelectionKey(selection);
                            if(!this._previousSelectionKeys[key]){
                                keep = false;
                            }
                        } else if(i >= filterSelectionMaxCount) {
                            keep = false;
                        }
                    }
                    
                    if(keep){
                        selections2.push(selection);
                    } else {
                        var datums = selection.__cccDatums;
                        if(datums){
                            if(def.array.is(datums)){
                                def.array.append(deselectDatums, datums);
                            } else {
                                deselectDatums.push(datums);
                            }
                        }
                        deselectCount--;
                    }
                }
                
                // Deselect datums beyond the max count
                pvc.data.Data.setSelected(deselectDatums, false);
                
                // Mark for update UI ASAP
                this._chart.updateSelections();
                
                this._vizHelper.showConfirm([
                                 'infoExceededMaxSelectionItems', 
                                 filterSelectionMaxCount
                             ], 
                             'SELECT_ITEM_LIMIT_REACHED');
            }
            
            // Index with the keys of previous selections
            this._previousSelectionKeys = 
                    def.query(selections2)
                        .object({
                            name:    function(selection){ return this._getSelectionKey(selection); },
                            value:   def.retTrue,
                            context: this
                        });
            
            return selections2;
        },
        
        /**
         * By default, the keep only or the exclude menu operations
         * do not select level gems playing a multi role.
         * 
         * The same applies to the the drill down operation,
         * that, by default, does not KEEP level gems playing
         * a multi role.
         * Note that a gem playing a multi role
         * can itself be drilled on.
         */
        _selectionExcludesMultiGems: function(){
            return true;
        },
        
        _processSelection: function(selectedDatums){
            /**
             * Selection rules.
             * 
             * -> gems with (chart)axis="measure" are excluded
             * 
             * -> gems playing a "multi" role are excluded (!except in the pie chart!)
             *    -> this way, points with common category data in 
             *       different small charts are simultaneously selected
             * 
             * -> measure discriminator gems are excluded
             *    this way, selection is always expanded to other series of different measures
             * 
             * this._gemCountColumnReportAxis :
             * 
             * -> if there are no gems with reportAxis='column':
             *    -> that's it. (most granular selection s available)
             * 
             * -> if there is a single gem with reportAxis='column': (!except in the HG chart!)
             *    -> gems with (chart)axis="row" are excluded
             *       (selecting one point selects every other point of the same "series")
             *     
             * -> if there is more that one gem with reportAxis='column':
             *    -> selection is disabled as a whole 
             *       (in this case, code doesn't even enter here)
             * 
             */
            /**
             * Example CCC "where" specification:
             * <pre>
             * whereSpec = [
             *     // Datums whose series is 'Europe' or 'Australia',
             *     // and whose category is 2001 or 2002
             *     {series: ['Europe', 'Australia'], category: [2001, 2002]},
             *
             *     // Union'ed with
             *
             *     // Datums whose series is 'America'
             *     {series: 'America'},
             * ];
             * </pre>
             */
            var whereSpec;
            var outDatums = [];
            
            if(selectedDatums.length){
                var selectionExcludesMulti = this._selectionExcludesMultiGems();
                
                // Include axis="column" dimensions
                // * Excludes measure discrim dimensions
                // * Excludes "multi" role dimensions
                var colDimNames = this.axes.column.getSelectionGems(selectionExcludesMulti)
                                  .select(function(gem){ return gem.cccDimName; })
                                  .array();
                
                var rowDimNames;
                if(!this._gemCountColumnReportAxis){
                    // Include axis="row" dimensions
                    // * Excludes "multi" role dimensions
                    rowDimNames = this.axes.row.getSelectionGems(selectionExcludesMulti)
                                      .select(function(gem){ return gem.cccDimName; })
                                      .array(); 
                }
                
                if(!colDimNames.length && (!rowDimNames || !rowDimNames.length)){
                    selectedDatums = [];
                } else {
                    whereSpec = [];
                    
                    selectedDatums.forEach(addDatum);
                    
                    this._chart.data
                        .datums(whereSpec, {visible: true})
                        .each(function(datum){
                            outDatums.push(datum);
                        });
                    
                    // Replace
                    selectedDatums = outDatums;
                }
            }
            
            function addDatum(datum) {
                if(!datum.isNull){
                    if(datum.isTrend){
                        // Some trend datums, like those of the scatter plot,
                        // don't have anything distinguishing between them,
                        // so we need to explicitly add them to the output.
                        outDatums.push(datum);
                    }
                    
                    var datumFilter = {};

                    var atoms = datum.atoms;
                    
                    if(colDimNames){
                        colDimNames.forEach(addDim);
                    }
                    
                    if(rowDimNames){
                        rowDimNames.forEach(addDim);
                    }
                    
                    whereSpec.push(datumFilter);
                }
                
                function addDim(dimName) {
                    // The atom itself may be used as a value condition
                    datumFilter[dimName] = atoms[dimName];
                }
            }
            
            return selectedDatums;
        },
        
        /* INTERACTIVE - DOUBLE-CLICK */

        _onDoubleClick: function(complex){
            /* A double-click is triggered to support "content linking" */
            if(this._hasContentLink){
                this._followContentlink(complex);
                return true;
            }
            
            /* Information about the axis and formula to follow hyperlink. */
            var hyperlinkInfo = this._getHyperlinkInfo(complex);
            if(hyperlinkInfo){
                this._followHyperlink(hyperlinkInfo, complex);
                return true;
            }
            
            /* Information about the axis and formula to drill on. */
            var drillInfo = this._getDrillDownInfo(complex);
            if(drillInfo){
                this._drillDown(drillInfo, complex);
                return true;
            }
            
            return false;
        },
        
        _followContentlink: function(complex){
            // Add every level gem with content link to the action context
            var actionContext = 
                def
                .query(this._linkAxesIds)
                .selectMany(function(axisId){
                    return this.axes[axisId]
                        .selectGemsWithLink('DASHBOARD', complex, /* reverse */ false);
                }, this)
                .select(function(gem){
                    return {
                        clickLevel: true,
                        formula:    gem.formula,
                        member:     complex.atoms[gem.cccDimName].value
                    };
                })
                .array()
                ;
            
            if(actionContext.length){ // J.I.C.
                this._vizHelper.link(actionContext);
            }
        },
        
        _hyperlinkTypes: {FILE: 1, URL: 1},
        
        _followHyperlink: function(hyperlinkInfo, complex){
            var actionContext = 
                def
                .query(this._linkAxesIds)
                .selectMany(function(axisId){
                    return this.axes[axisId].selectBoundGems(complex);
                }, this)
                .select(function(gem){
                    return {
                        clickLevel: (hyperlinkInfo.gem === gem),
                        formula:    gem.formula,
                        member:     complex.atoms[gem.cccDimName].value
                    };
                })
                .array()
                ;
            
            this._vizHelper.link(actionContext);
        },
        
        _drillDown: function(drillInfo, complex){
            /**
             * The context for the click action.
             * Stores 'KEEP' and 'KEEP_AND_DRILL' instructions.
             *
             * @see useGem
             */
            var actionContext = [];
            
            var drillGem = drillInfo.gem;
            var selectionExcludesMulti = this._selectionExcludesMultiGems();
            
            this._keyAxesIds.forEach(keepAxisHierarchies, this);

            // --------------

            this._vizHelper.click(actionContext, /* keepGem */ true);

            // ----------------
            // Helper methods
            
            /** @instance */
            function keepAxisHierarchies(axisId){
                // It is possible to KEEP_AND_DRILL on a multi level.
                // But, otherwise, a multi level is not KEPT.
                // The exception to the previous rule are 
                // the levels of the special multi-pie role. 
                this.axes[axisId]
                    .getKeepOrDrillGems(drillGem, selectionExcludesMulti)
                    .each(function(gem){
                        // KEEP or KEEP_AND_DRILL
                        if(gem === drillGem){
                            useGem(gem, drillInfo.atom, 'KEEP_AND_DRILL');
                        } else if(!gem.isMeasureDiscrim){
                            var atom = getGemAtom(gem, complex);
                            if(atom){
                                useGem(gem, atom, 'KEEP');
                            }
                        }
                    });
            }
            
            /** @static */
            function useGem(gem, atom, action){
                actionContext.push({
                    action:  action,
                    formula: gem.formula,
                    member:  atom.value,
                    caption: def.html.escape(atom.label)
                });
            }
            
            /** @static */
            function getGemAtom(gem, complex){
                var cccDimName;
                if(complex && (cccDimName = gem.cccDimName)){
                    var atom = complex.atoms[cccDimName];
                    if(atom && atom.value != null){
                        return atom;
                    }
                }
                
                return null;
            }
        },
        
        _getHyperlinkInfo: function(complex){
            /* Find an axis to hyperlink on. */
            return def.query(this._linkAxesIds)
                        .select(function(axisId){
                            return this.axes[axisId].getHyperlinkInfo(complex);
                        }, this)
                        .where(def.notNully)
                        .first() || null;
        },
        
        _getDrillDownInfo: function(complex){
            /* Find an axis to drill on.
             * The order of search is that of #_drillAxesIds.
             */
            return def.query(this._drillAxesIds)
                        .select(function(axisId){
                            return this.axes[axisId].getDrillDownInfo(complex);
                        }, this)
                        .where(def.notNully)
                        .first() || null;
        },

        /* UTILITY */
        
        /**
         * Converts a complex to an analyzer cell selection.
         *
         * An analyzer cell selection has the following structure:
         * {
         *    type:     'cell',
         *
         *    column:      table column index ??
         *    columnId:    ["[Time].[Years]", "[Time].[Quarters]"   ], // formulas
         *    columnItem:  ["[Time].[2003]",  "[Time].[2003].[QTR4]"], // values
         *    columnLabel: "2003~QTR4~Sales",
         *
         *    row:          table row index ??
         *    rowId:       ["[Markets].[Territory]", "[Order Status].[Type]"    ]  // formulas
         *    rowItem:     ["[Markets].[EMEA]",      "[Order Status].[Resolved]"], // values
         *    rowLabel:    "Type",
         *
         *    value:       28550.59 // formatted joined by ~ ?
         * }
         */
        _complexToCellSelection: function(complex, selectionExcludesMulti){
            /* The analyzer cell-selection object */
            var selection = { type: 'cell' };
            
            /* Add each axis' formulas to the selection */
            this._axesIds.forEach(function(axisId){
                this.axes[axisId].fillCellSelection(selection, complex, selectionExcludesMulti);
            }, this);

            return selection;
        },

        /**
         * Gets the child formula in the given formula's hierarchy.
         */
        getChildFormula: function(hForm){
            var hForms = this._getHierarchyFormulas(hForm,
                                /* includeHidden:   */ false,
                                /* excludeChildren: */ false);

            if(hForms){
                var index = hForms.indexOf(hForm);
                if(index >= 0){
                    return hForms[index + 1] || null;
                }
            }

            return null;
        },

        _getHierarchyFormulas: function(formula, includeHidden, excludeChildren){
            // This was very slow when not cached
            var hForms;
            var key = formula + "|" + (!!includeHidden) + "|" + (!!excludeChildren);

            if(!this._hierarchyFormulaCache) {
                this._hierarchyFormulaCache = {};
            } else {
                hForms = this._hierarchyFormulaCache[key];
            }

            if(!hForms) {
                hForms = this._vizHelper.getHierarchyFormulas(formula, includeHidden, excludeChildren);
                this._hierarchyFormulaCache[key] = hForms;
            }

            return hForms;
        },

        _addCdaMetadata: function(colName, colLabel, colType) {
            this._metadata.push({
                colIndex: this._metadata.length,
                colName:  colName,
                colLabel: colLabel,
                colType:  colType
            });
        },

        _getTableCell: function(tr, tc) {
            var cell = this._dataTable._getCell(tr, tc);
            if(!cell){
                return null;
            }
            
            var value = cell.v;
            if(value == null || value === '-') {
                return null;
            }

            return {
                v: value,
                f: cell.f
            };
        },
        
        _getTableValue: function(tr, tc) {
            var cell = this._getTableCell(tr, tc);
            return cell ? cell.v : ceff.f;
        }
    });

    def
    .type('pentaho.ccc.CartesianChart', pentaho.ccc.Chart)
    .add({
        _options: {
            orientation: 'vertical'
        },
        
        _configure: function(){

            this.base();

            this._configureAxesDisplayUnits();
            
            if(this._showAxisTitle('base')){
                this._configureAxisTitle('base',  this._getBaseAxisTitle ());
            }
            
            if(this._showAxisTitle('ortho')){
                this._configureAxisTitle('ortho', this._getOrthoAxisTitle());
            }
        },
        
        _showAxisTitle: def.fun.constant(true),
        
        _getOrthoAxisTitle: def.noop,

        _getBaseAxisTitle:  def.noop,

        _configureAxisTitle: function(axisType, title){
            var unitsSuffix = this._cartesianAxesDisplayUnitsText[axisType];

            title = def.string.join(" - ", title, unitsSuffix);

            if(title){
                var options = this.options;
                options[axisType + 'AxisTitle'] = title;
            }
        },

         _getMeasureRoleTitle: function(measureRole){
            var title = "";

            var measureAxis = this.axes.measure;
            var singleAxisGem;
            if(!measureRole){
                if(this.axes.measure.genericMeasuresCount === 1){
                    singleAxisGem = measureAxis.gemsByRole[measureAxis.defaultRole][0];
                }
            } else {
                var roleGems = measureAxis.gemsByRole[measureRole];
            if(roleGems.length === 1){
                    singleAxisGem = roleGems[0];
                }
            }
                
            if(singleAxisGem){
                title += singleAxisGem.label;
            }

            return title;
        },

        _configureAxisRange: function(primary, axisType){
            var vizOptions = this._vizOptions,
                suffix = primary ? '' : 'Secondary';
                
            if(vizOptions['autoRange' + suffix] !== 'true'){
                var limit = vizOptions['valueAxisLowerLimit' + suffix];
                if(limit != null){
                    this.options[axisType + 'AxisFixedMin'] = limit;
                    this.options[axisType + 'AxisOriginIsZero'] = false;
                }

                limit = vizOptions['valueAxisUpperLimit' + suffix];
                if(limit != null){
                    this.options[axisType + 'AxisFixedMax'] = limit;
                }
            }
        },
        
        _cartesianAxesDisplayUnitsText: null,
        
        _configureAxesDisplayUnits: function(){
            this._cartesianAxesDisplayUnitsText = {};
        },

        _configureAxisDisplayUnits: function(primary, axisType, allowFractional){
            if(!allowFractional){
                this.options[axisType + 'AxisTickExponentMin'] = 0; // 10^0 => 1
            }
            
            var text;
            var displayUnits = this._vizOptions['displayUnits' + (primary ? '' : 'Secondary')];
            if(displayUnits && displayUnits !== 'UNITS_0'){
                
                var match = displayUnits.match(/^UNITS_(\d+)$/) ||
                            def.fail.argumentInvalid('displayUnits');
                //var exponent = +match[1]; // + -> to number
                
                text = this._message('dlgChartOption_' + displayUnits);
            }
            
            this._cartesianAxesDisplayUnitsText[axisType] = text || "";
        }
    });

    // Categorical
    def
    .type('pentaho.ccc.CategoricalContinuousChart', pentaho.ccc.CartesianChart)
    .add({
        _options: {
            panelSizeRatio: 0.8,
            dataOptions: {
                measuresInColumns: false
            }
        },
        
        _showAxisTitle: function(type){
            return !this._hasMultiChartColumns || type === 'ortho';
        },
        
        _getOrthoAxisTitle: function(){
            return this._getMeasureRoleTitle();
        },

        _getBaseAxisTitle: function(){
            return this.axes.row.getAxisLabel();
        },

        _configure: function(){
            this.base();

            this._configureAxisRange(/*isPrimary*/true, 'ortho');
            
            if(this.options.orientation === 'vertical'){
                def.mixin(this.options, mixinDiscreteXOptions);
            } else {
                this.options.xAxisPosition = 'top';
            }
        },

        _configureAxesDisplayUnits: function(){
            this.base();
            
            this._configureAxisDisplayUnits(/*isPrimary*/true, 'ortho');
        }
    });
    
    // ---------------
    
    def
    .type('pentaho.ccc.BarChartAbstract', pentaho.ccc.CategoricalContinuousChart)
    .add({
        _cccClass: 'pvc.BarChart', // default class
        
        _configure: function(){
            
            this.base();
            
            var options = this.options;
            if(options.orientation !== 'vertical'){
                options.visualRoles.category = { isReversed: true };
            }
        }
    });
    
    // -------------------
    
    def
    .type('pentaho.ccc.BarChart', pentaho.ccc.BarChartAbstract)
    .add({
        _supportsTrends: true
    });
    
    def
    .type('pentaho.ccc.HorizontalBarChart', pentaho.ccc.BarChartAbstract)
    .add({
        _options: {
            orientation: 'horizontal'
        }
    });
    
    // -------------------
    
    def
    .type('pentaho.ccc.StackedBarChart', pentaho.ccc.BarChartAbstract)
    .add({
        _options: {
            stacked: true
        }
    });
    
    def
    .type('pentaho.ccc.HorizontalStackedBarChart', pentaho.ccc.BarChartAbstract)
    .add({
        _options: {
            orientation: 'horizontal',
            stacked: true
        }
    });
    
    // ---------------
    
    def
    .type('pentaho.ccc.NormalizedBarChartAbstract', pentaho.ccc.BarChartAbstract)
    .add({
        _cccClass: 'pvc.NormalizedBarChart',
        
        _configure: function(){
            
            this.base();

            this.options.orthoAxisTickFormatter = function(v){ return v + "%"; };
        }
    });
    
    
    def
    .type('pentaho.ccc.NormalizedBarChart', pentaho.ccc.NormalizedBarChartAbstract);
    
    def
    .type('pentaho.ccc.HorizontalNormalizedBarChart', pentaho.ccc.NormalizedBarChartAbstract)
    .add({
        _options: {
            orientation: 'horizontal'
        }
    });
    

    // ---------------
    
    def
    .type('pentaho.ccc.BarLineChart', pentaho.ccc.BarChartAbstract)
    .add({
        /* Override default map */
        _rolesToCccDimensionsMap: {
            'measuresLine': 'value' // maps to same dim group as 'measures' role
        },
    
        _options: {
            plot2: true,
            secondAxisIndependentScale: false,
            secondAxisSeriesIndexes: null // prevent default of -1 (which means last series) // TODO: is this needed??
        },
        
        _noRoleInTooltipMeasureRoles: {'measures': true, 'measuresLine': true},
        
        _setNullInterpolationMode: function(options, value){
            options.plot2NullInterpolationMode = value;
        },
        
        _initAxes: function(){
            this.base();
            
            this._measureDiscrimGem || def.assert("Must exist to distinguish measures.");
            
            var measureDiscrimCccDimName = this._measureDiscrimGem.cccDimName;
            var meaAxis = this.axes.measure;
            var barGems = meaAxis.gemsByRole[meaAxis.defaultRole];
            var barGemsById = 
                def
                .query(barGems) // bar: measures, line: measuresLine
                .uniqueIndex(function(gem){ return gem.id; });
            
            /* Create the dataPart dimension calculation */
            this.options.calculations.push({
                names: 'dataPart',
                calculation: function(datum, atoms){
                    var meaGemId = datum.atoms[measureDiscrimCccDimName].value;
                    // Data part codes
                    // 0 -> bars
                    // 1 -> lines
                    atoms.dataPart = def.hasOwn(barGemsById, meaGemId) ? '0' :'1';
                }
            });
        },
        
        _readUserOptions: function(options, vizOptions){
            
            this.base(options, vizOptions);
            
            var shape = vizOptions.shape;
            if(shape && shape === 'none'){
                options.pointDotsVisible = false;
            } else {
                options.pointDotsVisible = true;
                options.extensionPoints.pointDot_shape = shape;
            }
        },
        
       _configureAxesDisplayUnits: function(){

            this.base();

            this._configureAxisDisplayUnits(/*isPrimary*/false, 'ortho2');
        },
        
        _configure: function(){
            
            this.base();
            
            this._configureAxisRange(/*isPrimary*/false, 'ortho2');

            this._configureAxisTitle('ortho2',"");
            
            this.options.plot2OrthoAxis = 2;
             
            // Plot2 uses same color scale
            // options.plot2ColorAxis = 2;
            // options.color2AxisTransform = null;
        }
    });
    
    def
    .type('pentaho.ccc.WaterfallChart', pentaho.ccc.CategoricalContinuousChart)
    .add({
        _cccClass: 'pvc.WaterfallChart'
    })
    
    // ---------------
    
    def
    .type('pentaho.ccc.LineChart', pentaho.ccc.CategoricalContinuousChart)
    .add({
        _cccClass: 'pvc.LineChart',
        
        _supportsTrends: true,
        
        _options: {
            axisOffset:    0,
            tooltipOffset: 15
        },
        
        _drillAxesIds: ['row'/*, 'column'*/],
        
        _linkAxesIds: ['row', 'column'],
        
        _readUserOptions: function(options, vizOptions){
            
            this.base(options, vizOptions);
            
            var shape = vizOptions.shape;
            if(shape && shape === 'none'){
                options.dotsVisible = false;
            } else {
                options.dotsVisible = true;
                options.extensionPoints.dot_shape = shape;
            }
        },
        
        _setNullInterpolationMode: function(options, value){
            options.nullInterpolationMode = value;
        },
        
        _configureLegend: function(){
            
            this.base();
            
            var options = this.options;
            var extPoints = options.extensionPoints;
            
            var dotSize = extPoints.dot_shapeSize;
            if(dotSize != null){
                var dotRadius = Math.sqrt(dotSize);
                    options.legendMarkerSize = Math.max(15, 2 * (dotRadius + 3));
                }
            }
    });
    
    def
    .type('pentaho.ccc.StackedAreaChart', pentaho.ccc.CategoricalContinuousChart)
    .add({
       _cccClass: 'pvc.StackedAreaChart',
       
       _drillAxesIds: ['row'/*, 'column'*/],
       
       _linkAxesIds: ['row', 'column'],
       
       _options: {
           axisOffset:    0,
           tooltipOffset: 15
       },
    
       _setNullInterpolationMode: function(options, value){
           options.nullInterpolationMode = value;
       }
    });
    
    def
    .type('pentaho.ccc.BoxplotChart', pentaho.ccc.CategoricalContinuousChart)
    .add({
        _cccClass: 'pvc.BoxplotChart',
        
        _rolesToCccDimensionsMap: {
            'columns':     null,
            //'rows':      'category',
            'multi':       'multiChart',
            'measures':    'median',
            'percentil25': 'percentil25',
            'percentil75': 'percentil75',
            'percentil5':  'percentil5',
            'percentil95': 'percentil95'
        },
    
        _options: {
            extensionPoints: {
                boxRuleWhisker_strokeDasharray: '- '
            }
        },
        
        _readData: function(){
            // The boxplot data passes-trough, as is.
            this.base();

            // In CCC, it is read as a custom format (more relational-like)
            // Where categoriesCount is the number of "category" dimensions,
            // not including multichart columns...
            def.set(
                this.options.dataOptions,
                'categoriesCount', this.axes.row.gemsByRole.rows.length);
        }
    });
    
    def
    .type('pentaho.ccc.HeatGridChart', pentaho.ccc.CartesianChart)
    .add({
        _cccClass: 'pvc.HeatGridChart',
        
        _rolesToCccDimensionsMap: {
            'multi': null,
            //'columns':  'series',
            //'rows':     'category',
            'color': 'value',
            'size':  'value2'
        },
        
        _options: {
            valuesVisible: false,
            useShapes:     true,
            shape:         'square',
            
            xAxisSize: 30,
            yAxisSize: 50,
            axisComposite: true,
            orthoAxisGrid: false, // clear inherited property
            
            //colorMissing:   'lightgray',
            colorScaleType: 'linear',
            colorNormByCategory: false
        },
        
        _configure: function(){
            
            this.base();
            
            this.options.shape = this._vizOptions.shape;
        },
        
        _getColorScaleKind: function() { return 'continuous'; },
        
        _prepareLayout: function(options) {
            
            this.base(options);
            
            var measureCount = this.axes.measure.depth,
                catsDepth    = this.axes.row.depth,
                sersDepth    = this.axes.column.depth,
                catsBreadth  = Math.max(1, this._dataTable.getNumberOfRows() - 1),
                sersBreadth  = this._dataTable.getNumberOfColumns() - catsDepth;

            if(measureCount > 0){
                sersBreadth /= measureCount;
            }

            var width  = options.width,
                height = options.height,
                currRatio = width / height,
                xyChartRatio = catsBreadth / sersBreadth;

            // Min desirable sizes according to depth
            var MAX_AXIS_SIZE    = 300,
                MIN_LEVEL_HEIGHT = 70,
                MAX_LEVEL_HEIGHT = 200,
                MAX_AXIS_RATIO   = 0.35;

            var minXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MIN_LEVEL_HEIGHT),
                minYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MIN_LEVEL_HEIGHT),
                maxXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MAX_LEVEL_HEIGHT, height * MAX_AXIS_RATIO),
                maxYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MAX_LEVEL_HEIGHT, width  * MAX_AXIS_RATIO);

            var xAxisSize,
                yAxisSize;
            if(xyChartRatio > currRatio){ // lock width
                var extraHeight = height - width / xyChartRatio;

                yAxisSize = minYAxisSize;

                xAxisSize = Math.min(extraHeight, maxXAxisSize);
                xAxisSize = Math.max(xAxisSize,   minXAxisSize);
            } else if (xyChartRatio < currRatio){ // lock height
                var extraWidth = width - height * xyChartRatio;

                xAxisSize = minXAxisSize;

                yAxisSize = Math.min(extraWidth, maxYAxisSize);
                yAxisSize = Math.max(yAxisSize,  minYAxisSize);
            }

            // ------------------
            
            options.xAxisSize = xAxisSize;
            options.yAxisSize = yAxisSize;
        },

        // Ortho axis title is not available on the server, so never show
//        _getOrthoAxisTitle: function(){
//            return this.axes.column.getAxisLabel();
//        },
//
//        _getBaseAxisTitle: function(){
//            return this.axes.row.getAxisLabel();
//        },
        
        _doesSharedSeriesSelection: function(){
            return false;
        },
        
        _processSelection: function(selectedDatums){
            if(selectedDatums.length){
                var data = this._chart.data;
                
                var atomsByDim = {};
                
                // Select Cols OR Rows
                
                // These are optional in the HG
                var colDimNames = this.axes.column.getSelectionGems()
                                      .select(function(gem){ return gem.cccDimName; })
                                      .array();
                
                var rowDimNames = this.axes.row.getSelectionGems()
                                      .select(function(gem){ return gem.cccDimName; })
                                      .array();
                
                var nonAdditive = selectedDatums.length === 1 && selectedDatums[0].isSelected;
                
                var whereSpec;
                
                if(!nonAdditive){
                    // Now-selecting datums + Already selected datums
                    var selectDatumsById = def.query(selectedDatums)
                            .union(data.selectedDatums())
                            .uniqueIndex(function(datum){ return datum.id; });
                    
                    var rowGrouping = pvc.data.GroupingSpec.parse(rowDimNames, data.type);
                    var rowGroupedData = data.groupBy(rowGrouping, {
                        visible:  true,
                        where:    function(datum){ return def.hasOwn(selectDatumsById, datum.id); },
                        whereKey: null // prevent caching of groupedData
                    });
                    
                    var datumFilters = rowGroupedData
                        .leafs()
                        .select(function(leafData){
                            // rowDatumFilter
                            return def.copyProps(leafData.atoms, rowDimNames);
                        });
                    
                    if(colDimNames.length){
                        // Make all combinations of row leafs with col leafs
                        
                        var colGrouping = pvc.data.GroupingSpec.parse(colDimNames, data.type);
                        
                        var colGroupedData = data.groupBy(colGrouping, {
                            visible:  true,
                            where:    function(datum){ return def.hasOwn(selectDatumsById, datum.id); },
                            whereKey: null // prevent caching of groupedData
                        });
                        
                        datumFilters = datumFilters
                            .selectMany(function(rowDatumFilter){
                                return colGroupedData
                                    .leafs()
                                    .select(function(leafData){
                                        // Share the rowDatumFilter object by inheriting from it.
                                        // combined datumFilter
                                        return def.copyProps(Object.create(rowDatumFilter), leafData.atoms, colDimNames);
                                    });
                            });
                    }
                    
                    whereSpec = datumFilters.array();
                    
                    selectedDatums = data
                        .datums(whereSpec, {visible: true})
                        .array();
                } else {
                    // The only clicked datum is selected and
                    //  thus the user pretends to de-select.
                    // Expand to the selected datums that have the same series or 
                    // the same categories as the clicked one
                    // (a cross whose center is the clicked one)
                    // The result is that all these will be de-selected. 
                    var singleDatum = selectedDatums[0];
                    whereSpec = [
                        // Column dimensions datum filter
                        def.query(colDimNames)
                           .object({
                               value: function(cccDimName){ return singleDatum.atoms[cccDimName]; }
                           }),
                        
                        // OR
                        
                        // Row dimensions datum filter
                        def.query(rowDimNames)
                            .object({
                                value: function(cccDimName){ return singleDatum.atoms[cccDimName]; }
                            })
                    ];
                    
                    selectedDatums = data
                                        .datums(whereSpec, {visible: true, selected: true})
                                        .array();
                }
            }
            
            function addDatum(datum) {
                var atoms = datum.atoms;
                
                colDimNames.forEach(addDim);
                rowDimNames.forEach(addDim);

                function addDim(dimName) {
                    var dimAtomsById = (atomsByDim[dimName] || (atomsByDim[dimName] = {}));
                    var atom = atoms[dimName];
                    if(!def.hasOwn(dimAtomsById, atom.id)){
                        dimAtomsById[atom.id] = atom;
                    }
                }
            }
            
            function buildWhereSpec() {
                var datumFilter = {};
                var whereSpec   = [datumFilter];
                
                def.eachOwn(atomsByDim, addDim);
                
                function addDim(dimAtomsById, dimName) {
                    // The atom itself may be used as a value condition
                    datumFilter[dimName] = def.own(dimAtomsById);
                }
                
                return whereSpec;
            }
            
            return selectedDatums;
        }
    });
    
    def
    .type('pentaho.ccc.MetricDotChart', pentaho.ccc.CartesianChart)
    .add({
        _cccClass: 'pvc.MetricDotChart',
        
        _supportsTrends: true,
        
        _options: {
            axisGrid: true,
            
            sizeAxisUseAbs:  false,
            sizeAxisOriginIsZero: true,
            sizeAxisRatio:   1/5,
            sizeAxisRatioTo: 'height', // plot area client height
            
            autoPaddingByDotSize: false
        },
        
        /* Override Default map */
        _rolesToCccDimensionsMap: {
            'columns':  null,
            'color':    'color',
            //'rows':     'category',
            'multi':    'multiChart',
            'measures': null,
            'x':        'x',
            'y':        'y',
            'size':     'size'
        },
        
        _discreteColorRole: 'color',
        
        // Roles already in the axis' titles
        _noRoleInTooltipMeasureRoles: {'x': true, 'y': true, 'measures': false},
        
        _getColorScaleKind: function(){
            return this.axes.measure.boundRoles.color ? 'continuous' : 
                   this.axes.column.boundRoles.color  ? 'discrete'   :
                   undefined;
        },
        
        _configure: function(){

            this.base();

            var options = this.options;
            
            this._configureAxisRange(/*isPrimary*/true,  'base');
            this._configureAxisRange(/*isPrimary*/false, 'ortho');
            
            // DOT SIZE
            if(this.axes.measure.boundRoles.size){
                /* Axis offset like legacy analyzer */
                options.axisOffset = 1.1 * options.sizeAxisRatio / 2;
            } else {
                options.axisOffset = 0;
            }
        },
        
        _configureColor: function(colorScaleKind){
            
            this.base(colorScaleKind);
            
            var options = this.options;
            
            if(colorScaleKind === 'discrete'){
                // Must force the discrete type
                options.dimensionGroups.color = {
                    valueType: String
                };
                
//              options.visualRoles.color = 
//              this.axes.column.gemsByRole.color
//                   .map(function(gem, index){ 
//                      return pvc.buildIndexedId('color', index);
//                   })
//                   .join(', ');
            }
        },

        _showLegend: function(){
            
            // prevent default behavior that hides the legend when no series
            
            if(this.options.legend && this.axes.column.boundRoles.color){
                // Hide the legend if there is only one "series"
                return this._colGroups.length > 1;
            }
            
            return this.options.legend;
        },

        _getOrthoAxisTitle: function(){
            return this._getMeasureRoleTitle('y');
        },

        _getBaseAxisTitle: function(){
            return this._getMeasureRoleTitle('x');
        },
        
        _configureAxesDisplayUnits: function(){

            this.base();

            this._configureAxisDisplayUnits(/*isPrimary*/true,  'base' , /*allowFractional*/true);
            this._configureAxisDisplayUnits(/*isPrimary*/false, 'ortho', /*allowFractional*/true);
        }
    });
    
    // Custom
    def
    .type('pentaho.ccc.PieChart', pentaho.ccc.Chart)
    .add({
        _cccClass: 'pvc.PieChart',
        
        _noPercentInTootltipForPercentGems: true,
        
        _rolesToCccDimensionsMap: {
            'columns':  'multiChart',
            //'rows':     'category',
            'multi':    null
            //'measures': 'value'
        },
        
        _options: {
            valuesVisible: true,
            legendShape: 'circle',
            
            titlePosition: 'bottom',
            
            dataOptions: {
                measuresInColumns: false
            },
            
            extensionPoints: {
                slice_strokeStyle:'white',
                slice_lineWidth:   0.8
            }
        },
        
        _multiRole: 'columns',
        
        _discreteColorRole: 'rows',
        
        // Only 'multi' is on column axis, and drilling down on multi is undesired
        _drillAxesIds: ['row', 'column'],
        
        _linkAxesIds: ['row', 'column'],
        
        _configure: function(){
            
            this.base();
            
            // configure value label
            if(this.options.valuesVisible){
                this._configureValuesMask();
            }
        },
        
        _showLegend: function(){
            return this.options.legend && this.axes.row.depth > 0;
        },
        
        _readUserOptions: function(options, vizOptions) {
            this.base(options, vizOptions);
            
            options.valuesFont = defaultFont(null, readFontSize(vizOptions, 'label'));
        },
        
        _configureMultiChart: function(){
            this.base();
            
            this.options.legendSizeMax = '50%';
        },
        
        _configureValuesMask: function(){
            /* 
             * Change values mask according to each category's
             * discriminated measure being PCTOF or not
             */
            var colAxis = this.axes.column;
            var meaDiscrimName = colAxis.measureDiscrimName;
            if(meaDiscrimName) {
                var gemsMap = this.gemsMap;
                
                this.options.pie = {
                    scenes: {
                        category: {
                            sliceLabelMask: function(){
                                var meaAtom = this.atoms[meaDiscrimName];
                                var meaGemId, meaGem;
                                if(meaAtom && (meaGemId = meaAtom.value) && (meaGem = gemsMap[meaGemId]) && meaGem.measureType === 'PCTOF'){
                                    return "{value}"; // the value is the percentage itself;
                                }
                                
                                return "{value} ({value.percent})";
                            }
                        }
                    }
                };
            }
        },
        
        _selectionExcludesMultiGems: def.fun.constant(false)
    });

    def
    .type('pentaho.ccc.TreemapChart', pentaho.ccc.Chart)
    .add({
        _cccClass: 'pvc.TreemapChart',
        
        _rolesToCccDimensionsMap: {
            'columns':  null,
            'measures': null,
            'size':     'size'
        },
        
        _options: {
            //rootCategoryLabel:  Set in configure
            valuesVisible: true
            //valuesOptimizeLegibility: true
        },
        
        _discreteColorRole: 'rows',
        
        _configure: function() {
            
            this.base();
            
            this.options.rootCategoryLabel = this._message('chartTreeMapRootCategoryLabel');
        },
        
        _getDiscreteColorScale: function() {
            // Don't use memberPalette for now
            // as the given colors don't match the members that 
            // are actually colored in this visualization type.
            return this._getDefaultDiscreteColorScale();
        },
        
        _readUserOptions: function(options, vizOptions) {
            
            this.base(options, vizOptions);
            
            options.valuesFont = defaultFont(null, readFontSize(vizOptions, 'label'));
        }
    });
    
    def
    .type('pentaho.ccc.BulletChart', pentaho.ccc.Chart)
    .add({
        _cccClass: 'pvc.BulletChart',
        
        _rolesToCccDimensionsMap: {
            'multi':   null,
            'columns': 'subTitle',
            'rows':    'title'
            // The rest is dynamic...
            // measures:    -> split between value and marker dimensions...
            // bulletRanges -> range*
        },
        
        _options: {
            valuesVisible: true,
            valuesAnchor:  'right',

            titlePosition: 'top',
            titleSize: 25,
            
            bulletTitle:    "Test for title",
            bulletSubtitle: "Test for subtitle",
            bulletMeasures: [],
            // TODO: Constant bullets markers and ranges?
            bulletMarkers:  ["7500"],
            bulletRanges:   ["3000", "6500", "9000"],

            bulletMargin:   50,
            panelSizeRatio: 0.8,

            extensionPoints: {
                "bulletRuleLabel_font": "7pt sans"
            }
        },
        
        _configure: function(){

            this.base();

            /*
            var myself = this,
                options = this.options;

            // Drill down on shapes
            options.axisDoubleClickAction = function(d){
                var c = d.title,
                s = d.subtitle;

                myself._drillDown(myself._readCccAxesValues(s, c));
            };

            options.clickAction = function (c, s) {
                myself._notifySelectionChanged(
                    [ myself._convertKeysSelectionCccToAnalyzer(s, c) ]);
            };
            */
        },

        _prepareLayout: function(options){
            
            this.base(options);
            
            var vizOptions = this._vizOptions;

            var isVertical = options.orientation === 'vertical';
            if (this._resultset.length > 20) {
                options.bulletSize = 10;
                options.bulletSpacing = isVertical ? 60 : 20;
            } else if (this._resultset.length > 10) {
                options.bulletSize = 15;
                options.bulletSpacing = isVertical ? 80 : 30;
            } else {
                options.bulletSize = 20;
                options.bulletSpacing = isVertical ? 120 : 50;
            }

            var totalSpace = (2 + options.bulletSize + options.bulletSpacing) *
                             this._resultset.length;

            // TODO: vizOptions.controller.domNode
            if (isVertical) {
                if (totalSpace > options.width) {
                    vizOptions.controller.domNode.style.overflowX = 'auto';
                    vizOptions.controller.domNode.style.overflowY = 'hidden';

                    options.width = totalSpace;
                }
            } else {
                if (totalSpace > options.height) {
                    vizOptions.controller.domNode.style.overflowY = 'auto';
                    vizOptions.controller.domNode.style.overflowX = 'hidden';

                    options.height = totalSpace;
                }
            }
        }
    });

    /**
     * Creates a CDA resultset in a custom RELATIONAL format.
     *
     * 1    - Category - aggregated row axis columns
     * 2    - Series   - label of 'other' DataTable columns
     * 3    - Value    - numeric value of corresponding 'other' DataTable column
     * 4    - Marker   - marker numeric value of corresponding 'other' DataTable column
     * 5..R - Range r  - range numeric value, taken from vizOptions.bulletRanges
     */
    var oldCccChart = {};
    oldCccChart._readDataBullet = function() {
        var dataTable   = this._dataTable,
            rowCount    = dataTable.getNumberOfRows(),
            measureCols = this._otherDtColIndexes,
            seriesCount = this._otherDtColIndexes.length,
            vizOptions  = this._vizOptions;

        this.options.seriesInRows = true;
        
        this._addCdaMetadata('Category', 'Category', 'STRING' );
        this._addCdaMetadata('Series',   'Series',   'STRING' );
        this._addCdaMetadata('Value',    'Value',    'NUMERIC');
        this._addCdaMetadata('Marker',   'Marker',   'NUMERIC');

        if (vizOptions.bulletRanges) {
            for (var i = 0, R = vizOptions.bulletRanges.length; i < R ; i++){
                this._addCdaMetadata('Range'  + i, 'Range ' + i, 'NUMERIC');
            }
        }

        var measuresCount = this.axes.measure.depth;

        // Process the rows
        for(var tr = 0 ; tr < rowCount ; tr++){

            var category = this._aggregateRowAxisForTableRow(tr);

            for(var s = 0 ; s < seriesCount ; s += measuresCount) {
                // Measures should be defined in pairs
                // Each Value measure followed by a Marker measure:
                //  <ValueMeasure1, MarkerMeasure1>,
                //  <ValueMeasure2, MarkerMeasure2>,
                //  ...
                //  <ValueMeasureN [, MarkerMeasureN]>
                for(var m = 0 ; m < measuresCount ; m += 2) {
                    var valueColIndex  = s + m,
                        markerColIndex = valueColIndex + 1,
                        tc = measureCols[valueColIndex],
                        dtColParts = dataTable.getColumnId(tc).split('~');

                    dtColParts.pop();

                    var row = [
                    // Normal relational part
                        category, // aggregated category
                        dtColParts.join('~'), // series label
                        this._getTableValue(tr, tc),  // series value - may be null...is it ok?

                        // Marker - may be missing on the last measure pair
                        m + 1 < measuresCount ?
                        this._getTableValue(tr, measureCols[markerColIndex]) :
                        vizOptions.bulletMarkers[0] // TODO: 7500
                    ];

                    // Dynamic columns
                    var bulletRanges = vizOptions.bulletRanges;
                    if (bulletRanges){
                        bulletRanges.forEach(function(rangeValue){
                            row.push(rangeValue);
                        });
                    }

                    this._resultset.push(row);
                }
            }
        }
    };

    oldCccChart._aggregateRowAxisForTableRow = function(tr) {
        // Concat all of the string columns
        var values = this._rowNormalDtColIndexes.map(function(tc){
            return this._getTableValue(tr, tc);
        }, this);

        return values.join('~');
    };
    
    /**
     * Set of visualization options that
     * should not be copied to the CCC options.
     */
    var _skipVizOptions = pv.dict([
        'action',
        'autoRange',
        'backgroundColor',
        'backgroundColorEnd',
        'backgroundFill',
        'chartType',
        'controller',
        'customChartType',
        'displayUnits',
        'maxChartsPerRow',
        'emptyCellsMode',
        
        'labelSize',
        'labelStyle',
        'labelFontFamily',
        'labelColor',
        
        'legendBackgroundColor',
        'legendColor',
        'legendFontFamily',
        'legendStyle',

        // NOTE: analyzer's legendSize is more like a "legentFontSize",
        // while CCC's is the legend panel's size (width or height)
        'legendSize',

        'lineShape',
        'maxValues',
        'metrics',
        'palette',
        'selections'
    ],
    def.retTrue);

    // @private
    // @static
    function writeCccColumnDataType(colType){
        switch(colType){
            case 'string': return 'STRING';
            case 'number': return 'NUMERIC';
        }

        throw new Error("Unsupported data type");
    }

    // @private
    // @static
    function splitColGroupAndMeasure(colGroupAndMeasure){
        var sepIndex = colGroupAndMeasure.lastIndexOf('~');

        // MeasureName has precedence,
        // so we may end up with no column group value (and C = 0).
        if(sepIndex < 0){
            return ['', colGroupAndMeasure];
        }
      
        return [
            colGroupAndMeasure.substring(0,  sepIndex),
            colGroupAndMeasure.substring(sepIndex + 1)
        ];
    }

    // @private
    // @static
    function defaultFont(font, defaultSize){
        if(!font){
            return (defaultSize || 10) + 'px sans-serif';
        }

        return font.replace(/\bdefault\s*$/i, 'sans-serif');
    }
    
    // @private
    // @static
    function readFont(vizOptions, prefix){
        var size = vizOptions[prefix + "Size"];
        
        if (size) {
            var style = vizOptions[prefix + "Style"];
            if (style == null || style == 'PLAIN') {
                style = '';
            } else {
                style += ' ';
            }

            return style + size + 'px ' + vizOptions[prefix + "FontFamily"];
        }
    }
    
    function readFontSize(vizOptions, prefix){
        return +vizOptions[prefix + "Size"];
    }
    
    function readFontFamily(vizOptions, prefix){
        return vizOptions[prefix + "FontFamily"];
    }
    
    // FIX Analyzer's colors
    function colorFromAnalyzer(color){
        var L = color.length;
        if(L > 4 && L < 7 && color.charAt(0) === '#'){
            color = color.substr(1);
            if(L === 6){
                color = "#0" + color;
            } else { //if(L === 5){
                color = "#00" + color;
            }
        }
        return pv.color(color);
    }
    
    // @private
    // @static
    function getColumnRolesAndLevels(dataTable, tc){
        var dataReq = dataTable.getColumnProperty(tc, 'dataReq');
        if(dataReq){
            return def.array.to(dataReq).map(function(item){
             // NOTE: in IE, unbound columns do not come with an "undefined" role id ??
                if(!item.id){ item.id = 'undefined'; }
                return item; 
            });
        }
    }
});
