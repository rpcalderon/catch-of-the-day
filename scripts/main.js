var React = require('react');
var ReactDOM = require('react-dom');
var CSSTransitionGroup = require('react-addons-css-transition-group');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;
var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');

// Firebase
var Rebase = require('re-base');
var base = Rebase.createClass('https://catch-of-the-day-62056.firebaseio.com/');

var Catalyst = require('react-catalyst');

/*
	App
*/

var App = React.createClass({
	mixins : [Catalyst.LinkedStateMixin],
  getInitialState : function() {
  	return {
  		fishes : {},
  		order : {}
  	}
  },
  componentDidMount : function() {
  	//console.log("The component did mount");
  	base.syncState(this.props.params.storeId + '/fishes', {
  		context : this,
  		state: 'fishes'
  	});

  	var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);

  	if(localStorageRef) {
  		// Update our component state to reflect what is in localStorage
  		this.setState({
  			order : JSON.parse(localStorageRef)
  		});
  	}

  },
  componentWillUpdate : function(nextProps, nextState) {
  	//console.log(nextState);
  	localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
  },
  addToOrder : function(key) {
  	this.state.order[key] = this.state.order[key] + 1 || 1;
  	this.setState({ order : this.state.order });
  },
  removeFromOrder : function(key) {
  	delete this.state.order[key];
  	this.setState({
  		order : this.state.order
  	});
  },
  addFish : function(fish) {
  	var timestamp = (new Date()).getTime();
  	// update the state object
  	this.state.fishes['fish-' + timestamp] = fish;
  	// set the state
  	this.setState({ fishes : this.state.fishes });
  },
  removeFish : function(key) {
  	if(confirm("Are you sure you want to remove this fish?!")) {
	  	this.state.fishes[key] = null;
	  	this.setState({
	  		fishes : this.state.fishes
	  	});
	}
  },
  loadSamples : function() {
  	this.setState({
  		fishes : require('./sample-fishes')
  	});
  },
  renderFish : function(key){
  	return <Fish key={key} index={key} details={this.state.fishes[key]} 
  		addToOrder={this.addToOrder} />
  },
  render : function() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market"/>
          <ul className="list-of-fishes">
          	{Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>  
        <Order fishes={this.state.fishes} order={this.state.order} removeFromOrder={this.removeFromOrder} />
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} linkState={this.linkState} removeFish={this.removeFish} />
      </div>
    )
  }
});

/*
	Fish
	<Fish />
*/
var Fish = React.createClass({
	onButtonClick : function() {
		//console.log("Going to add the fish: ", this.props.index);
		var key = this.props.index;
		this.props.addToOrder(key);
	},
	render : function() {
		//{this.props.index}
		var details = this.props.details;
		var isAvailable = (details.status === 'available' ? true : false);
		var buttonText = (isAvailable ? 'Add To Order' : 'Sold Out!');
		return (
			<li className="menu-fish">
				<img src={details.image} alt={details.name} />
				<h3 className="fish-name">
					{details.name}
					<span className="price">{h.formatPrice(details.price)}</span>
				</h3>
				<p>{details.desc}</p>
				<button disabled={!isAvailable} onClick={this.onButtonClick}>{buttonText}</button>
			</li>
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
  renderOrder : function(key) {
  	var fish = this.props.fishes[key];
  	var count = this.props.order[key];
  	var removeButton = <button onClick={this.props.removeFromOrder.bind(null,key)}>&times;</button>

  	if(!fish) {
  		return <li key={key}>Sorry, fish no longer available! {removeButton}</li>
  	}

  	return (
  		<li key={key}>
  			<span>
	  			<CSSTransitionGroup 
	  				component="span" 
	  				transitionName="count" 
	  				transitionLeaveTimeout={250} 
	  				transitionEnterTimeout={250}>
	  				<span key={count}>{count}</span>
	  			</CSSTransitionGroup>

	  			lbs {fish.name} {removeButton}
  			</span>
  			<span className="price">{h.formatPrice(count * fish.price)}</span>
  		</li>)
  },
  render : function() {
  	var orderIds = Object.keys(this.props.order);
  
  	var total = orderIds.reduce((prevTotal, key)=> {
	  	var fish = this.props.fishes[key];
	  	var count = this.props.order[key];
	  	var isAvailable = fish && fish.status === 'available';

	  	if(fish && isAvailable) {
	  		return prevTotal + (count * parseInt(fish.price) || 0);
	  	}

	  	return prevTotal;
	}, 0);

    return (
      <div className="order-wrap">
      	<h2 className="order-title">Your Order</h2>

      	<CSSTransitionGroup 
      		className="order" 
      		component="ul" 
      		transitionName="order"
      		transitionEnterTimeout={500}
      		transitionLeaveTimeour={500}
      	>

      		{orderIds.map(this.renderOrder)}
      		<li className="total">
      			<strong>Total</strong>
      			{h.formatPrice(total)}
      		</li>
      	</CSSTransitionGroup>

      </div>
    )
  }
});

/*
  Inventory
  <Inventory/>
*/
var Inventory = React.createClass({
  renderInventory : function(key) {
    var linkState = this.props.linkState;
    return (
      <div className="fish-edit" key={key}>
        <input type="text" valueLink={linkState('fishes.'+ key +'.name')}/>
        <input type="text" valueLink={linkState('fishes.'+ key +'.price')}/>
        <select valueLink={linkState('fishes.' + key + '.status')}>
          <option value="unavailable">Sold Out!</option>
          <option value="available">Fresh!</option>
        </select>

        <textarea valueLink={linkState('fishes.' + key + '.desc')}></textarea>
        <input type="text" valueLink={linkState('fishes.'+ key +'.image')}/>
        <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
        
      </div>
    )
  },
  render : function() {
    return (
    	<div>
	      	<h2>Inventory</h2>
	      	
	      	{Object.keys(this.props.fishes).map(this.renderInventory)}

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

