define(["react", "underscore"], function(React, _) {

  var Printer = React.createClass({
    propTypes: {
      columns: React.PropTypes.array.isRequired,
      data: React.PropTypes.array.isRequired
    }, 
    render: function() {
      return (
        <html>
          <body>
            <table>
              <tr>
              {this.props.columns.map(function(column) {
                return <th>{column.label}</th>;
              })}
              </tr>

              {this.props.data.map(function(row) {
                return (
                  <tr>
                    {this.props.columns.map(function(column) {
                      return <td>{row[column.dataKey]}</td>;
                    })}
                  </tr>
                );
              }, this)}
            </table>
          </body>
        </html>
      );
    }
  });

  return Printer;
});
