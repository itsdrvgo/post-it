"use client";

import { SVGProps } from "react";

function PeerAmp({
    width,
    height,
    className,
    ...props
}: SVGProps<SVGSVGElement>) {
    const color = "#000";

    return (
        <svg
            id="PeerAmp"
            data-name="PeerAmp"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2000 2000"
            height={height || 30}
            width={width || 30}
            className={className}
            {...props}
        >
            <path
                fill={color}
                d="M785.85,1683.35H508.55a12.06,12.06,0,0,0-12.06,12.06h0a12.06,12.06,0,0,0,12.06,12.06h277.3a12.06,12.06,0,0,0,0-24.12Z"
            />
            <rect
                fill={color}
                x="496.49"
                y="1605.13"
                width="301.41"
                height="48.23"
                rx="12.06"
            />
            <rect
                fill={color}
                x="496.49"
                y="1478.7"
                width="301.41"
                height="96.45"
                rx="12.06"
            />
            <rect
                fill={color}
                x="496.49"
                y="1255.81"
                width="301.41"
                height="192.9"
                rx="12.06"
            />
            <path
                fill={color}
                d="M785.85,292.53h-27.3c-144.73,0-262.06,117.33-262.06,262.06v659.18a12.05,12.05,0,0,0,12.06,12h277.3a12.05,12.05,0,0,0,12.06-12V304.59A12.06,12.06,0,0,0,785.85,292.53Z"
            />
            <path
                fill={color}
                d="M1214.15,316.65h277.3a12.06,12.06,0,0,0,0-24.12h-277.3a12.06,12.06,0,0,0,0,24.12Z"
            />
            <rect
                fill={color}
                x="1202.09"
                y="346.65"
                width="301.41"
                height="48.23"
                rx="12.06"
            />
            <rect
                fill={color}
                x="1202.09"
                y="424.85"
                width="301.41"
                height="96.45"
                rx="12.06"
            />
            <rect
                fill={color}
                x="1202.09"
                y="551.28"
                width="301.41"
                height="192.9"
                rx="12.06"
            />
            <path
                fill={color}
                d="M1491.45,774.18h-277.3a12.05,12.05,0,0,0-12.06,12.05v909.18a12.06,12.06,0,0,0,12.06,12.06h27.3c144.73,0,262.06-117.33,262.06-262.06V786.23A12.05,12.05,0,0,0,1491.45,774.18Z"
            />
        </svg>
    );
}

export default PeerAmp;
