import React, { Component } from "react";
import Brewery from "./brewery";

const Results = props => {
    const breweries = props.breweries.map((brewery, index) => {
        return <Brewery key={index} brewery={brewery} />;
    });

    // return <div>{breweries}</div>;

    return (
        <div>
            {props.loading == true ? (
                <div className="loading">
                    <img
                        src={require("../img/loading-beer.gif")}
                        width="50"
                        height="50"
                        alt="Animated beer"
                    />
                    <h5>Loading...</h5>
                </div>
            ) : (
                <div className="breweries">{breweries}</div>
            )}
        </div>
    );
};

export default Results;
