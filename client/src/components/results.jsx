import React from "react";
import Brewery from "./brewery";

const Results = props => {
    const breweries = props.breweries.map((brewery, index) => {
        return <Brewery key={index} brewery={brewery} />;
    });

    let resultsContent;
    if (props.loading === true) {
        resultsContent = (
            <div className="loading">
                <img
                    src={require("../img/loading-beer.gif")}
                    width="50"
                    height="50"
                    alt="Animated beer"
                />
                <h5>Loading...</h5>
            </div>
        );
    } else if (props.loading === false && props.status) {
        resultsContent = <div className="status-message">{props.status}</div>;
    } else if (
        props.loading === false &&
        !props.status &&
        breweries.length === 0
    ) {
        resultsContent = (
            <div className="untappd-logo">
                <img
                    className="untappd-logo"
                    src={require("../img/pbu_40_grey.png")}
                    alt="Powered by Untappd"
                />
            </div>
        );
    } else {
        resultsContent = <div className="breweries">{breweries}</div>;
    }

    return <div>{resultsContent}</div>;
};

export default Results;
