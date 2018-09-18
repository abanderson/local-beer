const fs = require("fs");
const querystring = require("querystring");
const axios = require("axios");

let breweryNames;

fs.readFile("local-beer-brewery-names.json", (err, data) => {
    if (err) throw err;
    breweryNames = JSON.parse(data);
});

function addBreweryToCorrectionList(brewery) {
    // Search the breweryNames (correction list) object to see if
    // there is an entry for the brewery passed to the function...
    let breweryNameSearchResults = breweryNames.find(item => {
        return (
            item.googleName === brewery.name ||
            item.untappdName === brewery.name
        );
    });

    // If the brewery is not in the list, add it, log the addition
    // to the console and save it to the JSON file
    if (breweryNameSearchResults === undefined) {
        breweryNames.push({
            googleName: brewery.name,
            untappdName: "",
            address: brewery.address
        });
        fs.writeFile(
            "local-beer-brewery-names.json",
            JSON.stringify(breweryNames, 0, 4),
            err => {
                if (err) throw err;
                console.log(
                    `Brewery correction list (local-beer-brewery-name.json) updated with "${
                        brewery.name
                    }"`
                );
            }
        );
    }
}

function getCorrectBreweryName(brewery) {
    // module.exports.getCorrectBreweryName = brewery => {
    // Search the breweryNames (correction list) object to see if
    // there is an entry for the brewery passed to the function as well as
    // a corrected name for BeerAdvocate...
    let correctBreweryNameObject = breweryNames.find(item => {
        return item.googleName === brewery.name && item.untappdName != "";
    });

    // If there is, log the correction to the console and return the correct name,
    // otherwise return the original name
    if (correctBreweryNameObject != undefined) {
        console.log(
            `Correction found for brewery name: "${brewery.name}" --> "${
                correctBreweryNameObject.untappdName
            }"`
        );
        return correctBreweryNameObject.untappdName;
    } else {
        return brewery.name;
    }
}

function getDistanceBetweenBreweryCoordinates(lat1, lon1, lat2, lon2) {
    let deg2rad = deg => deg * (Math.PI / 180);

    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1);
    let dLon = deg2rad(lon2 - lon1);
    let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in km
    return d;
}

module.exports.getUntappdBreweryDetails = brewery => {
    return new Promise((resolve, reject) => {
        brewery.untappdName = getCorrectBreweryName(brewery);

        let untappdSearchQuery = querystring.stringify({
            q: brewery.untappdName,
            client_id: process.env.UNTAPPD_CLIENT_ID,
            client_secret: process.env.UNTAPPD_CLIENT_SECRET
        });
        untappdSearchQuery =
            "https://api.untappd.com/v4/search/brewery?" + untappdSearchQuery;

        axios
            .get(untappdSearchQuery)
            .then(response => {
                // Filter out results that are not within 25km of the original
                // Google search location
                let breweryData = response.data.response.brewery.items.filter(
                    item => {
                        return (
                            getDistanceBetweenBreweryCoordinates(
                                brewery.latitude,
                                brewery.longitude,
                                item.brewery.location.lat,
                                item.brewery.location.lng
                            ) < 25
                        );
                    }
                );

                // If no results are left in the brewery list after filtering for
                // distance, the name returned by Google did not match a brewery
                // on Untappd. It could be that the result is a bar or restaurant,
                // but it may also mean that it is an actual brewery that has a
                // different spelling on Untappd. So, the name is added to the
                // correction list.
                if (breweryData.length == 0) {
                    addBreweryToCorrectionList(brewery);
                }
                // Otherwise, save the brewery data in an object and return it.
                else {
                    let b = breweryData[0].brewery;

                    brewery.untappd_id = b.brewery_id;
                    brewery.untappd_beer_url = b.brewery_page_url;
                    brewery.untappd_label = b.brewery_label;
                    brewery.country = b.country_name;
                    brewery.city = b.location.brewery_city;
                    brewery.state = b.location.brewery_state;
                }

                resolve(brewery);
            })
            .catch(error => {
                reject(`Unable to get brewery details for ${brewery.name}`);
            });
    });
};

module.exports.getBeersForBrewery = brewery => {
    let untappdSearchQuery = querystring.stringify({
        client_id: process.env.UNTAPPD_CLIENT_ID,
        client_secret: process.env.UNTAPPD_CLIENT_SECRET
    });
    untappdSearchQuery = `https://api.untappd.com/v4/brewery/info/${
        brewery.untappd_id
    }?${untappdSearchQuery}`;

    return new Promise((resolve, reject) => {
        axios
            .get(untappdSearchQuery)
            .then(response => {
                brewery.beers = response.data.response.brewery.beer_list.items.map(
                    item => {
                        return {
                            beer_name: item.beer.beer_name,
                            beer_style: item.beer.beer_style,
                            beer_abv: item.beer.beer_abv,
                            beer_ibu: item.beer.beer_ibu,
                            beer_label: item.beer.beer_label,
                            beer_description: item.beer.beer_description,
                            untappd_beer_id: item.beer.bid,
                            untappd_beer_url: `https://untappd.com/b/${
                                item.beer.beer_slug
                            }/${item.beer.bid}`,
                            untappd_rating: item.beer.rating_score,
                            untappd_rating_count: item.beer.rating_count,
                            is_in_production: item.beer.is_in_production
                        };
                    }
                );
                resolve(brewery);
            })
            .catch(error => {
                reject(error);
            });
    });
};
