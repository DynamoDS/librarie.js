import * as React from "react";

type searchIconType = {
    color?: string;
    className?: string;
}

const SearchIcon = ({ color = "#999999", className = "Right" }: searchIconType) => {

    return (
        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" height="1rem" width="1rem"
            viewBox="0 0 16 16">
            <path className={`${className} st0`} d="M12,6c0,3.3-2.7,6-6,6S0,9.3,0,6s2.7-6,6-6S12,2.7,12,6z M6,1.5c-2.5,0-4.5,2-4.5,4.5s2,4.5,4.5,4.5
	s4.5-2,4.5-4.5S8.5,1.5,6,1.5z"fill={color} />
            <rect x="10.2" y="12.2" transform="matrix(0.7071 0.7071 -0.7071 0.7071 13.1716 -5.4558)" fill={color} className="st0" width="6" height="2" />
        </svg>

    );
}

export default SearchIcon;