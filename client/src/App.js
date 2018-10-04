import React, { Component } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import ReactGA from "react-ga";
import "./App.css";
import Navbar from "./components/navbar";
import Search from "./components/search";
import Filter from "./components/filter";
import Results from "./components/results";

library.add(fas);

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            breweries: [],
            displayedBreweries: [],
            loading: false,
            status: null
        };

        this.initGoogleAnayltics();
    }

    beerSearch(searchTerm) {
        this.setState({
            breweries: [],
            displayedBreweries: [],
            loading: true,
            status: null
        });
        ReactGA.event({
            category: "Search",
            action: "Searched for a location",
            value: searchTerm
        });
        let formattedSearchTerm = searchTerm.toLowerCase().trim();
        Axios.get(`/api/search?q=${formattedSearchTerm}`)
            .then(response => {
                if (response.data.length === 0) {
                    this.setState({
                        loading: false,
                        status: `No breweries found near ${searchTerm}`
                    });
                } else {
                    this.setState({
                        breweries: response.data,
                        displayedBreweries: response.data,
                        loading: false
                    });
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

    filterResults(filterString) {
        let lowerCaseFilterString = filterString.toLowerCase();

        let filteredResults = this.state.breweries.map(brewery => {
            let breweryCopy = { ...brewery };
            breweryCopy.beers = breweryCopy.beers.filter(beer => {
                return (
                    String(beer.beer_abv).includes(lowerCaseFilterString) ||
                    beer.beer_description
                        .toLowerCase()
                        .includes(lowerCaseFilterString) ||
                    String(beer.beer_ibu).includes(lowerCaseFilterString) ||
                    beer.beer_name
                        .toLowerCase()
                        .includes(lowerCaseFilterString) ||
                    beer.beer_style
                        .toLowerCase()
                        .includes(lowerCaseFilterString) ||
                    beer.brewery
                        .toLowerCase()
                        .includes(lowerCaseFilterString) ||
                    beer.brewery_address
                        .toLowerCase()
                        .includes(lowerCaseFilterString)
                );
            });
            return breweryCopy;
        });

        filteredResults = filteredResults.filter(brewery => {
            return brewery.beers.length > 0;
        });

        this.setState({ displayedBreweries: filteredResults });
    }

    initGoogleAnayltics() {
        console.log("Initialized");
        ReactGA.initialize("UA-126991946-1");
        ReactGA.pageview(window.location.pathname + window.location.search);
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
                    {this.state.breweries.length > 0 &&
                    !this.state.loading &&
                    !this.state.status ? (
                        <Filter
                            onResultsFilter={this.filterResults.bind(this)}
                        />
                    ) : (
                        <div />
                    )}

                    <Results
                        breweries={this.state.displayedBreweries}
                        loading={this.state.loading}
                        status={this.state.status}
                    />
                </div>
            </div>
        );
    }
}

export default App;
