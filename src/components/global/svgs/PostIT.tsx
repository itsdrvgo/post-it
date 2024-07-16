import { SVGProps } from "react";

export function PostIT({
    width,
    height,
    className,
    ...props
}: SVGProps<SVGSVGElement>) {
    return (
        <svg
            id="PostIT"
            data-name="PostIT"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 500"
            height={height || 30}
            width={width || 30}
            className={className}
            {...props}
        >
            <path
                fill="#fff"
                d="M287,334.85A142.9,142.9,0,1,0,200.07,78.52L70.14,113.33l13.63,50.86,35.76-9.58,63.2,235.88L147,400.07l13.63,50.87,130.78-35.05L277.76,365,242,374.61l-14.06-52.48A142.36,142.36,0,0,0,287,334.85Zm0-230.52A87.63,87.63,0,1,1,199.33,192,87.63,87.63,0,0,1,287,104.33Z"
            />
        </svg>
    );
}
