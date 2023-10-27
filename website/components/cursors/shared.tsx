"use client";

import { useEffect, useState } from "react";
import { useCursors } from "./context";
import OtherCursor from "./other";
import SelfCursor from "./self";



export default function SharedSpace() {
  const { others, self } = useCursors();
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const onResize = () => {

      setWindowDimensions({
        // width: window.innerWidth,
        // height: window.innerHeight,
        width: document.body.clientWidth,
        height: document.body.clientHeight
      });
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // useEffect(() => {
  //   // Add the class 'overflow-hidden' on body to prevent scrolling
  //   document.body.classList.add("overflow-hidden");
  //   // Scroll to top
  //   window.scrollTo(0, 0);
  //   return () => {
  //     document.body.classList.remove("overflow-hidden");
  //   };
  // }, []);


  return (
    <div className="cursors">


      {Object.keys(others).map((id) => (
        <div key={id}>
          <OtherCursor
            id={id}
            windowDimensions={windowDimensions}
            fill="#06f"
          />
        </div>
      ))}
      {self?.pointer === "touch" && (
        <SelfCursor windowDimensions={windowDimensions} />
      )}
    </div>

  );
}