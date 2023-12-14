import * as React from "react";

type arrowType = {
    color?: string;
    position?: "Right" | "Down";
}

const Arrow = ({ color = "#84D7CE", position = "Right" }: arrowType) => {

    return (
        <svg className={"ArrowIcon " + position} width="4" height="7" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="icon-wrapper">
                <path id="&#240;&#159;&#140;&#136;  icon-color" fillRule="evenodd" clipRule="evenodd" d="M4 4L0 7.5L0 0.5L4 4Z" fill={color} />
            </g>
        </svg>

    );
}

export default Arrow;