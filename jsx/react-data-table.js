define(["react", "fixedDataTable", "fuse", "underscore"], function(React, FixedDataTable, Fuse, _) {

  var DEFAULT_COLUMN_WIDTH = 100;
  var DEFAULT_COLUMN_FLEXGROW = 1;


  var ReactDataTable = React.createClass({
    propTypes: {
      columns: React.PropTypes.array.isRequired,
      data: React.PropTypes.array.isRequired,
      searchKeys: React.PropTypes.array,
      widthMargin: React.PropTypes.number,
      heightMargin: React.PropTypes.number,
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired,
      showInfo: React.PropTypes.bool,
      showFilter: React.PropTypes.bool,
      showPrint: React.PropTypes.bool,
      onPrint: React.PropTypes.func
    },
    getDefaultProps: function() {
      return {
        widthMargin: 0,
        heightMargin: 0,
        searchKeys: []
      };
    },
    getInitialState: function() {
      return {
        data: this.props.data,
        fuse: this.getFuseInstance(this.props.data),
        width: this.props.width,
        height: this.props.height
      };
    },
    componentDidMount: function() {
      window.addEventListener("resize", this.handleResize);
    },
    componentWillReceiveProps: function(newProps) {
      if(newProps.data.length != this.props.data.length) {
        this.setState({
          data: newProps.data,
          fuse: this.getFuseInstance(newProps.data) 
        });
      } 
    },
    getFuseInstance: function(fuseData) {
      return new Fuse(fuseData, {
        threshold: 0,
        keys: this.props.searchKeys
      });
    },
    handleResize: function() {
      this.setState({
        width: window.innerWidth - this.props.widthMargin,
        height: window.innerHeight - this.props.heightMargin
      });
    },
    filter: function(value) {
      var result = value != "" ? this.state.fuse.search(value) : this.props.data;
      this.setState({ data: result });
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
    				<ReactDataTable.Print showPrint={this.props.showPrint} onPrint={this.props.onPrint} data={this.state.data} />
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


  ReactDataTable.Print = React.createClass({
    propTypes: {
      showPrint: React.PropTypes.bool,
      data: React.PropTypes.array.isRequired,
      onPrint: React.PropTypes.func
    },
    getDefaultProps: function() {
      return {
        showPrint: true
      }
    },
    onClick: function() {
      this.props.onPrint(this.props.data);
    },
    render: function() {
      if(!this.props.showPrint) {
        return <span />;
      } 

      return (
        <span className="react-data-table-print">
          <a href="#" onClick={this.onClick}>Print</a>
        </span>
      )
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
      var sortIconClassname = this.getSortableColumnIcon(this.state.sortBy[columnProps.label]);

      return function() {
        return (
          <div className="react-data-table-sortable-column" onClick={gridContext.sortBy.bind(gridContext, columnProps.dataKey, columnProps.label)}>
            <i className={sortIconClassname}></i> {columnProps.label}
          </div>
        );
      };
    },
    sortBy: function(key, label) {
      var columnSortedBy = this.state.sortBy[label] && this.state.sortBy[label] === "desc" ? "asc" : "desc",
          columnProps = _.find(this.props.columns, function(column) {
            return column.label === label;
          }),
          sortFunction = columnProps.sort ? columnProps.sort : this.compare;

      this.setState({
        rows: this.props.data.sort(function(a,b) {
          var leftOperand = columnProps.sortPattern ? columnProps.sortPattern(a) : a[key];
          var rightOperand = columnProps.sortPattern ? columnProps.sortPattern(b) : b[key];
          return columnSortedBy === "desc" ? sortFunction(leftOperand, rightOperand) : sortFunction(rightOperand, leftOperand);
        }),
        sortBy: _.tap([], function(object) { object[label] = columnSortedBy })
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
