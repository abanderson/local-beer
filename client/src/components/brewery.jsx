import React from "react";
import Beer from "./beer";

const Brewery = ({ brewery }) => {
    const beers = brewery.beers.map((beer, index) => {
        return <Beer key={index} beer={beer} />;
    });

    return (
        <div>
            <div className="row brewery-heading">
                <div className="col">
                    <img className="brewery-logo" src={brewery.untappd_label} alt={`${brewery.name} logo`} />
                    <h3>{brewery.name}</h3>
                    <h6 className="text-muted brewery-address">
                        {brewery.address}
                    </h6>
                </div>
            </div>
            <div className="row">
                <div className="card-columns">{beers}</div>
            </div>
        </div>
    );
};

export default Brewery;
