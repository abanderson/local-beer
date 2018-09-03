import React, { Component } from "react";
import Axios from "axios";
import "./App.css";
import Navbar from "./components/navbar";
import Search from "./components/search";
import Results from "./components/results";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            breweries: []
        };
    }

    beerSearch(searchTerm) {
        Axios.get(`/api/search?q=${searchTerm}`).then(response => {
            this.setState({ breweries: response.data });
        });
    }

    render() {
        return (
            <div className="App">
                <Navbar />
                <div className="container">
                    <Search onSearchSubmit={this.beerSearch.bind(this)} />
                    <Results breweries={this.state.breweries} />
                </div>
            </div>
        );
    }
}

export default App;
