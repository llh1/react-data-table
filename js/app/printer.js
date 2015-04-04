define(["react", "underscore"], function(React, _) {

  var Printer = React.createClass({displayName: 'Printer',
    propTypes: {
      columns: React.PropTypes.array.isRequired,
      data: React.PropTypes.array.isRequired
    }, 
    render: function() {
      return (
        React.createElement("html", null, 
          React.createElement("body", null, 
            React.createElement("table", null, 
              React.createElement("tr", null, 
              this.props.columns.map(function(column) {
                return React.createElement("th", null, column.label);
              })
              ), 

              this.props.data.map(function(row) {
                return (
                  React.createElement("tr", null, 
                    this.props.columns.map(function(column) {
                      return React.createElement("td", null, row[column.dataKey]);
                    })
                  )
                );
              }, this)
            )
          )
        )
      );
    }
  });

  return Printer;
});
