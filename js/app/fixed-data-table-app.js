define(["react", "underscore", "fixedDataTable", "fuse", "fakeData"], 
  function(React, _, FixedDataTable, Fuse, FakeData) {

  var Table = FixedDataTable.Table;
  var Column = FixedDataTable.Column;
  var fuzzySearch = new Fuse(FakeData, {threshold: 0, keys: ["name", "city", "country", "email"]});

  var SearchBox = React.createClass({displayName: 'SearchBox',
    searchQuery: function(event) {
      this.props.onChange(event.target.value);
    },
    render: function() {
      return (
        React.createElement("div", null, 
          "Filter results: ", React.createElement("input", {type: "text", name: "search", onChange: this.searchQuery}), 
          this.props.dataCount, " rows"
        )
        );
    }
  });

	var DataTable = React.createClass({displayName: 'DataTable',
    getInitialState: function() {
        return {
            sortBy: {}
        };
    },
    sortBy: function(event) {
      var key = event.target.innerText.toLowerCase();
      var sortBy = this.state.sortBy;
      var columnSortedBy = sortBy[key] && sortBy[key] === "asc" ? "desc" : "asc";

      this.setState({
        rows: this.props.data.sort(function(a,b) {
          if(columnSortedBy === "desc") {
            return b[key].localeCompare(a[key]);
          } else {
            return a[key].localeCompare(b[key]);
          }
        }),
        sortBy: _.tap(sortBy, function(object) { object[key] = columnSortedBy })
      });
    },
    getRow: function(rowIndex) {
        return this.props.data[rowIndex];
    },
    getSortableColumn: function(name) {
      var tableControl = this;
      return function() {
        return React.createElement("div", {onClick: tableControl.sortBy}, name);
      };
    },
    render: function() {
        var sortableNameColumn = this.getSortableColumn("name");
        var sortableCityColumn = this.getSortableColumn("city");
        var sortableCountryColumn = this.getSortableColumn("country");
        var sortablePhoneColumn = this.getSortableColumn("phone");
        var sortableEmailColumn = this.getSortableColumn("email");

        return (React.createElement(Table, {
                maxHeight: 700, 
                      width: 1000, 
                      rowsCount: this.props.data.length, 
                      rowHeight: 50, 
                      headerHeight: 40, 
                      rowGetter: this.getRow}, 

              React.createElement(Column, {dataKey: "name", 
                      width: 100, 
                      flexGrow: 1, 
                      headerRenderer: sortableNameColumn, 
                      label: "Name"}), 

              React.createElement(Column, {dataKey: "city", 
                      width: 100, 
                      flexGrow: 1, 
                      headerRenderer: sortableCityColumn, 
                      label: "City"}), 

              React.createElement(Column, {dataKey: "email", 
                      width: 200, 
                      flexGrow: 1, 
                      headerRenderer: sortableEmailColumn, 
                      label: "Email"}), 

              React.createElement(Column, {dataKey: "country", 
                      width: 100, 
                      flexGrow: 1, 
                      headerRenderer: sortableCountryColumn, 
                      label: "Country"}), 

              React.createElement(Column, {dataKey: "phone", 
                      width: 100, 
                      flexGrow: 1, 
                      headerRenderer: sortablePhoneColumn, 
                      label: "Phone"})
              )
        );
    }
  });

  var MyGrid = React.createClass({displayName: 'MyGrid',
    getInitialState: function() {
      return {
        query: null,
        data: FakeData
      }
    },
    search: function(value) {
      this.setState({
        query: value,
        data: value != "" ? fuzzySearch.search(value) : FakeData
      });
    },
    render: function() {
      return (
        React.createElement("div", null, 
          React.createElement(SearchBox, {onChange: this.search, dataCount: this.state.data.length}), 
          React.createElement("br", null), 
          React.createElement(DataTable, {data: this.state.data})
        )
      );
    }
  });

	React.render(React.createElement(MyGrid, null), document.getElementById('container'));
});