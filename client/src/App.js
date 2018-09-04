import React, { Component } from "react";
import Axios from "axios";
import "./App.css";
import Navbar from "./components/navbar";
import Search from "./components/search";
import Results from "./components/results";
import Footer from "./components/footer";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            breweries: [],
            loading: false
        };
    }

    beerSearch(searchTerm) {
        this.setState({ breweries: [], loading: true });
        Axios.get(`/api/search?q=${searchTerm}`).then(response => {
            this.setState({ breweries: response.data, loading: false });
        });
    }

    render() {
        return (
            <div className="App">
                <Navbar />
                <div className="container">
                    <Search onSearchSubmit={this.beerSearch.bind(this)} />
                    <Results
                        breweries={this.state.breweries}
                        loading={this.state.loading}
                    />
                </div>
            </div>
        );
    }
}

export default App;
