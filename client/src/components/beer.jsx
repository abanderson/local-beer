import React from "react";

const Beer = ({ beer }) => {
    return (
        // <div className="col-md-6 col-lg-4">
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">{beer.beer_name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                    {beer.beer_style}
                </h6>
                <img className="card-image" src={beer.beer_label} alt={`${beer.beer_name} label`} />
                <p className="card-text">
                    ABV: <span className="text-info">{beer.beer_abv}%</span>
                </p>
                <p className="card-text">
                    IBU: <span className="text-info">{beer.beer_ibu}</span>
                </p>
                <p className="card-text">
                    Rating:{" "}
                    <span className="text-info">{beer.untappd_rating}</span>
                </p>
                <p className="card-text card-description">
                    {beer.beer_description}
                </p>
                <a href={beer.untappd_beer_url} className="card-link">
                    View on Untappd
                </a>
            </div>
        </div>
        // </div>
    );
};

export default Beer;
