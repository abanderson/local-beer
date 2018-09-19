import React, { Component } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import "./App.css";
import Navbar from "./components/navbar";
import Search from "./components/search";
import Results from "./components/results";

library.add(fas);

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            breweries: [],
            loading: false,
            status: null
        };
    }

    beerSearch(searchTerm) {
        this.setState({ breweries: [], loading: true, status: null });
        let formattedSearchTerm = searchTerm.toLowerCase().trim();
        Axios.get(`/api/search?q=${formattedSearchTerm}`)
            .then(response => {
                if (response.data.length === 0) {
                    this.setState({
                        loading: false,
                        status: `No breweries found near ${searchTerm}`
                    });
                } else {
                    this.setState({ breweries: response.data, loading: false });
                }
            })
            .catch(error => {
                console.error(error);
                this.setState({
                    breweries: [],
                    loading: false,
                    status:
                        "Something went wrong! Most likely, the number of requests for Untappd data has exceeded their hourly limit. Please try again in a little while."
                });
            });
    }

    locationSearch(latitude, longitude) {
        this.setState({ loading: true });
        Axios.get(`/api/geosearch?lat=${latitude}&lng=${longitude}`).then(
            response => {
                this.beerSearch(response.data);
            }
        );
    }

    render() {
        return (
            <div className="App">
                <Navbar />
                <div className="container">
                    <Search
                        onSearchSubmit={this.beerSearch.bind(this)}
                        onLocationUpdate={this.locationSearch.bind(this)}
                    />
                    <Results
                        breweries={this.state.breweries}
                        loading={this.state.loading}
                        status={this.state.status}
                    />
                </div>
            </div>
        );
    }
}

export default App;
