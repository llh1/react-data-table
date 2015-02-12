define(["react", "underscore", "fixedDataTable", "fuse", "fakeData"], 
  function(React, _, FixedDataTable, Fuse, FakeData) {

  var Table = FixedDataTable.Table;
  var Column = FixedDataTable.Column;
  var fuzzySearch = new Fuse(FakeData, {threshold: 0, keys: ["name", "city", "country", "email"]});

  var SearchBox = React.createClass({
    searchQuery: function(event) {
      this.props.onChange(event.target.value);
    },
    render: function() {
      return (
        <div>
          Filter results: <input type="text" name="search" onChange={this.searchQuery} />
          {this.props.dataCount} rows
        </div>
        );
    }
  });

	var DataTable = React.createClass({
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
        return <div onClick={tableControl.sortBy}>{name}</div>;
      };
    },
    render: function() {
        var sortableNameColumn = this.getSortableColumn("name");
        var sortableCityColumn = this.getSortableColumn("city");
        var sortableCountryColumn = this.getSortableColumn("country");
        var sortablePhoneColumn = this.getSortableColumn("phone");
        var sortableEmailColumn = this.getSortableColumn("email");

        return (<Table
                maxHeight={700}
                      width={1000}
                      rowsCount={this.props.data.length}
                      rowHeight={50}
                      headerHeight={40}
                      rowGetter={this.getRow}>

              <Column dataKey="name"
                      width={100}
                      flexGrow={1}
                      headerRenderer={sortableNameColumn}
                      label="Name"/>

              <Column dataKey="city"
                      width={100}
                      flexGrow={1}
                      headerRenderer={sortableCityColumn}
                      label="City"/>

              <Column dataKey="email"
                      width={200}
                      flexGrow={1}
                      headerRenderer={sortableEmailColumn}
                      label="Email" />

              <Column dataKey="country"
                      width={100}
                      flexGrow={1}
                      headerRenderer={sortableCountryColumn}
                      label="Country" />

              <Column dataKey="phone"
                      width={100}
                      flexGrow={1}
                      headerRenderer={sortablePhoneColumn}
                      label="Phone" />
              </Table>
        );
    }
  });

  var MyGrid = React.createClass({
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
        <div>
          <SearchBox onChange={this.search} dataCount={this.state.data.length} />
          <br />
          <DataTable data={this.state.data} />
        </div>
      );
    }
  });

	React.render(<MyGrid />, document.getElementById('container'));
});