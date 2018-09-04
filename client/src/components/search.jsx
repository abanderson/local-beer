import React, { Component } from "react";

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = { searchTerm: "" };
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onSearchSubmit(this.state.searchTerm);
        this.setState({ searchTerm: "" });
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
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default Search;
