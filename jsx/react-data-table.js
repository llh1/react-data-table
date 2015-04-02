define(["react", "fixedDataTable", "fuse", "underscore"], function(React, FixedDataTable, Fuse, _) {

  var DEFAULT_COLUMN_WIDTH = 100;
  var DEFAULT_COLUMN_FLEXGROW = 1;


  var ReactDataTable = React.createClass({
    propTypes: {
      columns: React.PropTypes.array.isRequired,
      data: React.PropTypes.array.isRequired,
      widthMargin: React.PropTypes.number,
      heightMargin: React.PropTypes.number,
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired
    },
    getDefaultProps: function() {
      return {
        widthMargin: 0,
        heightMargin: 0
      };
    },
    getInitialState: function() {
      return {
        fuse: new Fuse(this.props.data, {
          threshold: 0,
          keys: _.pluck(this.props.columns, "dataKey")
        }),
        query: null,
        data: this.props.data,
        width: this.props.width,
        height: this.props.height
      };
    },
    componentDidMount: function() {
      window.addEventListener("resize", this.handleResize);
    },
    handleResize: function() {
      this.setState({
        width: window.innerWidth - this.props.widthMargin,
        height: window.innerHeight - this.props.heightMargin
      });
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
      var { columns, data, showInfo, info, width, height, ...other } = this.props;
      var columnsWithBindedRenderers = this.bindRenderersContext();

  		return (
  			<div className="react-data-table">
          <div className="react-data-table-header">
    				<ReactDataTable.Info showInfo={this.props.showInfo} info={this.props.info} recordsCount={this.state.data.length} />
            <ReactDataTable.Filter showFilter={this.props.showFilter} onChange={this.filter} />
          </div>
  				<ReactDataTable.Grid columns={columnsWithBindedRenderers} 
  				  data={this.state.data} 
  				  width={this.state.width}
  				  height={this.state.height}
  				  {...other} />
  			</div>
  		);
  	}
  });


  ReactDataTable.Filter = React.createClass({
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
        return <span />;

      return (
        <span className="react-data-table-filter">
          Search: <input type="text" onChange={this.onChange} />
        </span>
      );
    }
  });


  ReactDataTable.Info = React.createClass({
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
        return <span />;

      var defaultInfo = this.props.recordsCount + " records";
      return <span>{this.props.info || defaultInfo}</span>;
    }
  });


  ReactDataTable.Grid = React.createClass({
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
          <div className="react-data-table-sortable-column" onClick={gridContext.sortBy.bind(gridContext, columnProps.dataKey)}>
            <i className={sortIconClassname}></i> {columnProps.label}
          </div>
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
        <div className="react-data-table-grid" style={{width: this.props.width}}>
          <FixedDataTable.Table rowsCount={this.props.data.length} rowGetter={this.getRow} {...this.props}>
            {this.props.columns.map(function(columnProps) {
                var { cellRenderer, headerRenderer, ...otherColumnProps } = columnProps;
                return <FixedDataTable.Column key={columnProps.dataKey} 
                                              width={columnProps.width || DEFAULT_COLUMN_WIDTH}
                                              flexGrow={columnProps.flexGrow || DEFAULT_COLUMN_FLEXGROW}
                                              headerRenderer={columnProps.sortable ? this.getSortableColumn(columnProps) : columnProps.headerRenderer}
                                              cellRenderer={columnProps.cellRenderer ? columnProps.cellRenderer : null}
                                              {...otherColumnProps} />;
            }, this)}
          </FixedDataTable.Table>
        </div>
      );
    }
  });


  return ReactDataTable;
});
