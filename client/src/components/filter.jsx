import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactGA from "react-ga";

class Filter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            controlsOpen: false,
            searchTerm: ""
        };
    }

    toggleFilter() {
        let filterContainer = document.getElementsByClassName(
            "filter-container"
        )[0];
        let filterControls = document.getElementsByClassName(
            "filter-controls"
        )[0];

        if (filterContainer.classList.contains("filter-container-open")) {
            filterContainer.classList.replace(
                "filter-container-open",
                "filter-container-close"
            );
            filterControls.classList.replace(
                "filter-controls-open",
                "filter-controls-close"
            );
            this.setState({ controlsOpen: false });
            document.getElementsByClassName("filter-input-field")[0].blur();
        } else if (
            filterContainer.classList.contains("filter-container-close")
        ) {
            filterContainer.classList.replace(
                "filter-container-close",
                "filter-container-open"
            );
            filterControls.classList.replace(
                "filter-controls-close",
                "filter-controls-open"
            );
            this.setState({ controlsOpen: true });
            document.getElementsByClassName("filter-input-field")[0].focus();
            this.logAnalyticsFilterEvent();
        } else {
            filterContainer.classList.add("filter-container-open");
            filterControls.classList.add("filter-controls-open");
            this.setState({ controlsOpen: true });
            document.getElementsByClassName("filter-input-field")[0].focus();
            this.logAnalyticsFilterEvent();
        }
    }

    logAnalyticsFilterEvent() {
        ReactGA.event({
            category: "Filter",
            action: "Filtered results"
        });
    }

    onInputChange(searchTerm) {
        this.setState({ searchTerm });
        this.props.onResultsFilter(searchTerm);
    }

    render() {
        return (
            <div>
                <div
                    className="filter-toggle text-secondary"
                    onClick={this.toggleFilter.bind(this)}
                >
                    <div className="filter-label">Filter</div>
                    <div className="filter-caret fa-lg">
                        {this.state.controlsOpen ? (
                            <FontAwesomeIcon icon="angle-up" />
                        ) : (
                            <FontAwesomeIcon icon="angle-down" />
                        )}
                    </div>
                </div>
                <div className="filter-container">
                    <div className="filter-controls">
                        <input
                            className="form-control filter-input-field"
                            type="text"
                            placeholder="Filter results"
                            aria-label="Filter results"
                            value={this.state.searchTerm}
                            onChange={event =>
                                this.onInputChange(event.target.value)
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Filter;
