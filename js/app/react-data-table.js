define(["react", "fixedDataTable", "fuse", "underscore"], function(React, FixedDataTable, Fuse, _) {

  var DEFAULT_COLUMN_WIDTH = 100;
  var DEFAULT_COLUMN_FLEXGROW = 1;


  var ReactDataTable = React.createClass({displayName: 'ReactDataTable',
    getInitialState: function() {
      return {
        fuse: new Fuse(this.props.data, {
          threshold: 0,
          keys: _.pluck(this.props.columns, "dataKey")
        }),
        query: null,
        data: this.props.data
      };
    },
    filter: function(value) {
      var result = value != "" ? this.state.fuse.search(value) : this.props.data;

      this.setState({
        query: value,
        data: result
      });
    },
    bindRenderersContext: function() {
      return _.map(this.props.columns, function(prop) {
        if(prop.cellRenderer)
          prop.cellRenderer = prop.cellRenderer.bind(this);

        if(prop.headerRenderer)        
          prop.headerRenderer = prop.headerRenderer.bind(this);

        return prop;
      }, this);
    },
  	render: function() {
      var $__0=        this.props,columns=$__0.columns,data=$__0.data,showInfo=$__0.showInfo,info=$__0.info,other=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{columns:1,data:1,showInfo:1,info:1});
      var columnsWithBindedRenderers = this.bindRenderersContext();

  		return (
  			React.createElement("div", {className: "react-data-table"}, 
          React.createElement("div", {className: "react-data-table-header"}, 
    				React.createElement(ReactDataTable.Info, {showInfo: this.props.showInfo, info: this.props.info, recordsCount: this.state.data.length}), 
            React.createElement(ReactDataTable.Filter, {showFilter: this.props.showFilter, onChange: this.filter})
          ), 
  				React.createElement(ReactDataTable.Grid, React.__spread({columns: columnsWithBindedRenderers, data: this.state.data},  other))
  			)
  		);
  	}
  });


  ReactDataTable.Filter = React.createClass({displayName: 'Filter',
    propTypes: {
      showFilter: React.PropTypes.bool,
      onChange: React.PropTypes.func
    },
    getDefaultProps: function() {
      return {
        showFilter: true
      }
    },
    onChange: function(event) {
      this.props.onChange(event.target.value);
    },
    render: function() {
      if(!this.props.showFilter)
        return React.createElement("span", null);

      return (
        React.createElement("span", {className: "react-data-table-filter"}, 
          "Search: ", React.createElement("input", {type: "text", onChange: this.onChange})
        )
      );
    }
  });


  ReactDataTable.Info = React.createClass({displayName: 'Info',
    propTypes: {
      showInfo: React.PropTypes.bool,
      info: React.PropTypes.string,
      recordsCount: React.PropTypes.number
    },
    getDefaultProps: function() {
      return {
        showInfo: true
      };
    },
    render: function() {
      if(!this.props.showInfo)
        return React.createElement("span", null);

      var defaultInfo = this.props.recordsCount + " records";
      return React.createElement("span", null, this.props.info || defaultInfo);
    }
  });


  ReactDataTable.Grid = React.createClass({displayName: 'Grid',
    propTypes: {
      columns: React.PropTypes.array.isRequired,
      data: React.PropTypes.array.isRequired
    },
    getInitialState: function() {
      return {
        sortBy: {},
        sortFunctions: {}
      };
    },
    getRow: function(rowIndex) {
      return this.props.data[rowIndex];
    },
    getSortableColumnIcon: function(sortedBy) {
      switch(sortedBy) {
        case "asc": return "fa fa-sort-desc react-data-table-sort-desc";
        case "desc": return "fa fa-sort-asc react-data-table-sort-asc";
        default: return "fa fa-sort react-data-table-sort"
      }
    },
    getSortableColumn: function(columnProps) {
      var gridContext = this;
      var sortIconClassname = this.getSortableColumnIcon(this.state.sortBy[columnProps.dataKey]);

      return function() {
        return (
          React.createElement("div", {className: "react-data-table-sortable-column", onClick: gridContext.sortBy.bind(gridContext, columnProps.dataKey)}, 
            React.createElement("i", {className: sortIconClassname}), " ", columnProps.label
          )
        );
      };
    },
    sortBy: function(key, event) {
      var columnSortedBy = this.state.sortBy[key] && this.state.sortBy[key] === "desc" ? "asc" : "desc",
          columnProps = _.find(this.props.columns, function(column) {
            return column.dataKey === key;
          }),
          sortFunction = columnProps.sort ? columnProps.sort : this.compare;

      this.setState({
        rows: this.props.data.sort(function(a,b) {
          return columnSortedBy === "desc" ? sortFunction(b[key], a[key]) : sortFunction(a[key], b[key]);
        }),
        sortBy: _.tap([], function(object) { object[key] = columnSortedBy })
      });
    },
    compare: function(a, b) {
      return a.localeCompare(b);
    },
    render: function() {
      return (
        React.createElement("div", {className: "react-data-table-grid", style: {width: this.props.width}}, 
          React.createElement(FixedDataTable.Table, React.__spread({rowsCount: this.props.data.length, rowGetter: this.getRow},  this.props), 
            this.props.columns.map(function(columnProps) {
                var $__0=      columnProps,cellRenderer=$__0.cellRenderer,headerRenderer=$__0.headerRenderer,otherColumnProps=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{cellRenderer:1,headerRenderer:1});
                return React.createElement(FixedDataTable.Column, React.__spread({key: columnProps.dataKey, 
                                              width: columnProps.width || DEFAULT_COLUMN_WIDTH, 
                                              flexGrow: columnProps.flexGrow || DEFAULT_COLUMN_FLEXGROW, 
                                              headerRenderer: columnProps.sortable ? this.getSortableColumn(columnProps) : columnProps.headerRenderer, 
                                              cellRenderer: columnProps.cellRenderer ? columnProps.cellRenderer : null}, 
                                              otherColumnProps));
            }, this)
          )
        )
      );
    }
  });


  return ReactDataTable;
});
