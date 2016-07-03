var React = require('react');
var ReactDOM = require('react-dom');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;
var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');
/*
	App
*/

var App = React.createClass({
  getInitialState : function() {
  	return {
  		fishes : {},
  		order : {}
  	}
  },
  addFish : function(fish) {
  	var timestamp = (new Date()).getTime();
  	// update the state object
  	this.state.fishes['fish-' + timestamp] = fish;
  	// set the state
  	this.setState({ fishes : this.state.fishes });
  },
  loadSamples : function() {
  	this.setState({
  		fishes : require('./sample-fishes')
  	});
  },
  render : function() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market"/>
        </div>  
        <Order/>
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples}/>
      </div>
    )
  }
});

/*
	Add Fish Form
	<AddFishForm/>
*/
var AddFishForm = React.createClass({
	createFish : function(event) {
		//1. Stop the form from submitting
		event.preventDefault();
		//2. Take the data from the form and create and object
		var fish = {
			name : this.refs.name.value,
			price : this.refs.price.value,
			status : this.refs.status.value,
			desc : this.refs.desc.value,
			image : this.refs.image.value
		}
		//console.log(fish);
		//3. Add the fish to the App State
		this.props.addFish(fish);
		this.refs.fishForm.reset();
	},
	render : function() {
		return (
			<form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
		        <input type="text" ref="name" placeholder="Fish Name"/>
		        <input type="text" ref="price" placeholder="Fish Price" />
		        <select ref="status">
		          <option value="available">Fresh!</option>
		          <option value="unavailable">Sold Out!</option>
		        </select>
		        <textarea type="text" ref="desc" placeholder="Desc"></textarea>
		        <input type="text" ref="image" placeholder="URL to Image" />
		        <button type="submit">+ Add Item </button>
      		</form>
		)
	}
});

/*
  Header
  <Header/>
*/
var Header = React.createClass({
  render : function() {
  	//console.log(this.props);
    return (
      <header className="top">
      	<h1>Catch 
      		<span className="ofThe">
      			<span className="of">of</span>
      			<span className="the">the</span>
      		</span>
      	Day</h1>
      	<h3 className="tagline"><span>{this.props.tagline}</span></h3>
      </header>
    )
  }
});

/*
  Order
  <Order/>
*/
var Order = React.createClass({
  render : function() {
    return (
      <p>Order</p>
    )
  }
});

/*
  Inventory
  <Inventory/>
*/
var Inventory = React.createClass({
  render : function() {
    return (
    	<div>
	      	<h2>Inventory</h2>

	      	<AddFishForm /*{addFish={this.addFish}}*/ {...this.props} />
	      	<button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      	</div>
    )
  }
});

/*
	StorePicker
	This will let us make <StorePicker/>
*/

var StorePicker = React.createClass({
	mixins : [History],
	goToStore : function(event) {
		event.preventDefault();
		//console.log('Ya submitted it!');
		// get the data from the input
		//console.log(this.refs);
		var storeId = this.refs.storeId.value;
		//console.log(storeId);
		this.history.pushState(null, '/store/' + storeId);
		//transition from <StorePicker/> to <App/>

	},
	render : function() {
		//var name = "wes";
		return (
			<form className="store-selector" onSubmit={this.goToStore}>
				<h2>Please Enter A Store {/*{name}*/}</h2>
				<input type="text" defaultValue={h.getFunName()} ref="storeId" required/>
				<input type="Submit"/>
			</form>
		)
	}
});

/*
  Not Found
*/

var NotFound = React.createClass({
  render : function() {
    return <h1>Not Found!</h1>
  }
});

/*
	Routes
*/

var routes = (
	<Router history={createBrowserHistory()}>
		<Route path="/" component={StorePicker}/>
		<Route path="/store/:storeId" component={App}/>
		<Route path="*" component={NotFound}/>
	</Router>
)

ReactDOM.render(routes, document.querySelector('#main'));

