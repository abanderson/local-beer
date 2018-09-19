import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: "",
            latitude: "",
            longitude: ""
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        document.getElementsByClassName("form-control")[0].blur(); // Remove focus from the search field (hides keyboard on iOS)
        this.props.onSearchSubmit(this.state.searchTerm);
        this.setState({ searchTerm: "" });
    }

    handleLocationButtonClick() {
        navigator.geolocation.getCurrentPosition(position => {
            this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
            this.props.onLocationUpdate(
                this.state.latitude,
                this.state.longitude
            );
        });
    }

    onInputChange(searchTerm) {
        this.setState({ searchTerm });
    }

    render() {
        return (
            <div className="row">
                <div className="col">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <div className="input-group mb-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter a location"
                                aria-label="Enter a location"
                                aria-describedby="button-addon2"
                                name="search"
                                value={this.state.searchTerm}
                                onChange={event =>
                                    this.onInputChange(event.target.value)
                                }
                            />
                            <div className="input-group-append">
                                <button
                                    className="btn btn-outline-secondary"
                                    type="submit"
                                    id="button-addon2"
                                >
                                    Search
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={this.handleLocationButtonClick.bind(
                                        this
                                    )}
                                >
                                    <FontAwesomeIcon icon="location-arrow" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default Search;
