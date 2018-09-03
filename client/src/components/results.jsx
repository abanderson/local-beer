import React, { Component } from "react";
import Brewery from "./brewery";

const Results = props => {
    const breweries = props.breweries.map((brewery, index) => {
        return <Brewery key={index} brewery={brewery} />;
    });

    return <div>{breweries}</div>;
};

export default Results;
