const querystring = require("querystring");
const axios = require("axios");
const Sequelize = require("sequelize");
const models = require("./models");

const Op = Sequelize.Op;

module.exports.addBreweryToDatabase = (brewery) => {
    // Search the database to see if there is an entry for the brewery
    // passed to the function. If the brewery is not in the database,
    // add it and log the addition to the console.

    return new Promise((resolve, reject) => {
        models.Place.findOrCreate({
            where: { googleName: brewery.name, address: brewery.address },
        })
            // .spread((place, created) => {
            .then((place, created) => {
                if (created) {
                    console.log(
                        `Brewery database updated with "${brewery.name}"`
                    );
                    models.Place.update(
                        { isDisplayed: true },
                        {
                            where: {
                                googleName: brewery.name,
                                address: brewery.address,
                            },
                        }
                    ).catch((error) => {
                        console.log(error);
                    });
                }
                resolve(brewery);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
};

function getBreweryNameFromDatabase(brewery) {
    // Search the database to see if there is an entry for the brewery
    // passed to the function as well as a corrected name for BeerAdvocate.
    // If there is, log the correction to the console and return the correct name,
    // otherwise return the original name.
    return new Promise((resolve, reject) => {
        models.Place.findOne({
            where: {
                googleName: brewery.name,
                // untappdName: { $ne: null },
                untappdName: { [Op.ne]: null },
                address: brewery.address,
            },
        })
            .then((result) => {
                if (result && result.untappdName != brewery.name) {
                    console.log(
                        `Correction found for brewery name: "${brewery.name}" --> "${result.untappdName}"`
                    );
                    resolve(result.untappdName);
                } else {
                    resolve(brewery.name);
                }
            })
            .catch((error) => {
                console.error(error);
                reject(`Error querying database for "${brewery.name}"`);
            });
    });
}

function addOrUpdateUntappdBreweryInDatabase(brewery) {
    return new Promise((resolve, reject) => {
        models.Place.update(
            { untappdName: brewery.untappdName },
            { where: { googleName: brewery.name, address: brewery.address } }
        )
            .then(() => {
                resolve(brewery);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

module.exports.filterHiddenBreweries = (brewery) => {
    return new Promise((resolve, reject) => {
        models.Place.findOne({
            where: {
                googleName: brewery.name,
                address: brewery.address,
                isDisplayed: { [Op.not]: false },
                // isDisplayed: { $not: false }
            },
        })
            .then((result) => {
                if (result) {
                    resolve(brewery);
                } else {
                    resolve(null);
                }
            })
            .catch((error) => {
                console.error(error);
                reject(`Error filtering brewery: ${brewery.name}`);
            });
    });
};

module.exports.getUntappdBreweryDetails = (brewery) => {
    return new Promise((resolve, reject) => {
        getBreweryNameFromDatabase(brewery)
            .then((untappdName) => {
                brewery.untappdName = untappdName;

                let untappdSearchQuery = querystring.stringify({
                    q: untappdName,
                    client_id: process.env.UNTAPPD_CLIENT_ID,
                    client_secret: process.env.UNTAPPD_CLIENT_SECRET,
                });

                untappdSearchQuery =
                    "https://api.untappd.com/v4/search/brewery?" +
                    untappdSearchQuery;

                return axios.get(untappdSearchQuery);
            })
            .then((response) => {
                let breweryData = response.data.response.brewery.items;

                // If there are no breweries in the response, the name returned
                // by Google did not match a brewery on Untappd. It could be that
                // the result is a bar or restaurant, but it may also mean that
                // it is an actual brewery that has a different spelling on
                // Untappd. So, the name is added to the correction database.
                if (breweryData.length == 0) {
                    return brewery;
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

                    return addOrUpdateUntappdBreweryInDatabase(brewery);
                }
            })
            .then((brewery) => {
                resolve(brewery);
            })
            .catch((error) => {
                console.error(error);
                reject(`Unable to get brewery details for ${brewery.name}`);
            });
    });
};

module.exports.getBeersForBrewery = (brewery) => {
    let untappdSearchQuery = querystring.stringify({
        client_id: process.env.UNTAPPD_CLIENT_ID,
        client_secret: process.env.UNTAPPD_CLIENT_SECRET,
    });
    untappdSearchQuery = `https://api.untappd.com/v4/brewery/info/${brewery.untappd_id}?${untappdSearchQuery}`;

    return new Promise((resolve, reject) => {
        axios
            .get(untappdSearchQuery)
            .then((response) => {
                brewery.beers = response.data.response.brewery.beer_list.items.map(
                    (item) => {
                        return {
                            beer_name: item.beer.beer_name,
                            beer_style: item.beer.beer_style,
                            beer_abv: item.beer.beer_abv,
                            beer_ibu: item.beer.beer_ibu,
                            beer_label: item.beer.beer_label,
                            beer_description: item.beer.beer_description,
                            untappd_beer_id: item.beer.bid,
                            untappd_beer_url: `https://untappd.com/b/${item.beer.beer_slug}/${item.beer.bid}`,
                            untappd_rating: item.beer.rating_score,
                            untappd_rating_count: item.beer.rating_count,
                            is_in_production: item.beer.is_in_production,
                            brewery: brewery.name,
                            brewery_address: brewery.address,
                        };
                    }
                );
                resolve(brewery);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
