import * as React from "react";

type clearIconType = {
    color?: string;
}

const ClearIcon = ({ color = "#999999" }: clearIconType) => {

    return (
        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" height="1rem" width="1rem" x="0px" y="0px" fill={color}
            viewBox="0 0 16 16">
            <polygon className="st0" points="15,2.3 13.7,1.1 8,6.8 2.3,1.1 1,2.4 6.7,8.1 1.2,13.6 2.4,14.9 8,9.3 13.6,14.9 14.8,13.7 9.2,8.1 " />
        </svg>

    );
}

export default ClearIcon;