const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require("querystring");
const localBeer = require("../local-beer.js");

router.get("/search", (req, res, next) => {
    // Build the Google Places API search query
    let googleSearchQuery = querystring.stringify({
        query: `${req.query.q} breweries`,
        key: process.env.GOOGLE_API_KEY
    });
    googleSearchQuery =
        "https://maps.googleapis.com/maps/api/place/textsearch/json?" +
        googleSearchQuery;

    // Search Google for breweries at the specified location and create
    // a list of 'brewery' objects storing the results
    axios
        .get(googleSearchQuery)
        .then(response => {
            let breweries = response.data.results.map(result => {
                let brewery = {};
                brewery.name = result.name;
                brewery.untappdName = result.name;
                brewery.address = result.formatted_address;
                brewery.latitude = result.geometry.location.lat;
                brewery.longitude = result.geometry.location.lng;
                return brewery;
            });

            return Promise.all(
                breweries.map(brewery => {
                    return localBeer.addBreweryToDatabase(brewery);
                })
            );
        })
        // Then, find which breweries in the database are marked to
        // not be displayed...
        .then(breweries => {
            return Promise.all(
                breweries.map(brewery => {
                    return localBeer.filterHiddenBreweries(brewery);
                })
            );
        })
        // ...and filter them out. Then, feed the brewery names to
        // the Untappd API to get information about each brewery
        .then(breweries => {
            breweries = breweries.filter(brewery => {
                return brewery != null;
            });

            return Promise.all(
                breweries.map(brewery => {
                    return localBeer.getUntappdBreweryDetails(brewery);
                })
            );
        })
        // Then, get information about the available beers at each
        // brewery
        .then(breweries => {
            // Filter out breweries that have no untappd id
            // This means a brewery matching the name returned by
            // Google was not found on Untappd
            breweries = breweries.filter(brewery => {
                return brewery.untappd_id != undefined;
            });

            return Promise.all(
                breweries.map(brewery => {
                    return localBeer.getBeersForBrewery(brewery);
                })
            );
        })
        // Finally, send the brewery and beer list as JSON
        .then(breweries => res.json(breweries))
        .catch(error => {
            console.error(error);
            next(error);
        });
});

router.get("/geosearch", (req, res, next) => {
    // Build the Google Geocode search query
    let googleSearchQuery = querystring.stringify({
        latlng: `${req.query.lat},${req.query.lng}`,
        key: process.env.GOOGLE_API_KEY
    });
    googleSearchQuery =
        "https://maps.googleapis.com/maps/api/geocode/json?" +
        googleSearchQuery;

    axios
        .get(googleSearchQuery)
        .then(response => {
            let location = [];
            response.data.results.forEach(result => {
                result.address_components.forEach(component => {
                    if (component.types.includes("locality")) {
                        location.push(component);
                    }
                });
            });
            if (location.length > 0) {
                res.json(location[0].long_name);
            } else res.json([]);
        })
        .catch(error => {
            console.error(error);
            next(error);
        });
});

module.exports = router;
