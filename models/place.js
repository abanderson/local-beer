"use strict";
module.exports = (sequelize, DataTypes) => {
    var Place = sequelize.define(
        "Place",
        {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            googleName: {
                type: DataTypes.STRING,
                // unique: true,
                allowNull: false
            },
            untappdName: { type: DataTypes.STRING },
            address: { type: DataTypes.STRING },
            isBrewery: { type: DataTypes.BOOLEAN }
        },
        {}
    );
    Place.associate = function(models) {
        // associations can be defined here
    };
    return Place;
};
