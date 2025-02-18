import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={70}
    height={70}
    viewBox="0 0 84 82"
    fill="black"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      x={1.364}
      y={1.25}
      width={80.804}
      height={78.967}
      rx={35.811}
      stroke="#fff"
      strokeOpacity={0.2}
      strokeWidth={1.836}
    />
    <Rect
      x={9.628}
      y={9.514}
      width={64.276}
      height={62.439}
      rx={25.71}
      fill="#F8F8F8"
      fillOpacity={0.1}
    />
    <Path
      d="M34.42 40.734h14.692m-7.346 7.346V33.388"
      stroke="#fff"
      strokeWidth={1.836}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
