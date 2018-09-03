import React from "react";

const Navbar = () => {
    return (
        <nav className="navbar navbar-light bg-light mb-4">
            <span className="navbar-brand">
                <img
                    src={require("../img/icons8-beer-glass-100-yellow.png")}
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                    alt="Beer logo"
                />
                Local Beer
            </span>
        </nav>
    );
};

export default Navbar;
