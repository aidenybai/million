import React, { useEffect } from "react";
import moment from "moment";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link, animateScroll as scroll } from "react-scroll"; 
import './LandingScreen.css'; 
import Navbar from "../components/Navbar";
import Navbar2 from './Navbar2';
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";

AOS.init({
    duration: '500'
});

function LandingScreen() {
    const scrollToSection = (sectionId) => {
        scroll.scrollTo(sectionId, {
            duration: 800,
            smooth: "easeInOutQuart", 
        });
    };

    return (
        <>
            <div className="landing-page">
                
                <Navbar2 />
              
                <div id="fullpage">
                    <Section1/>
                    <Section2/>
                    <Section3/>
                </div>

                <div className="scroll-links">
                    <a
                        href="#section1"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("section1").scrollIntoView({
                                behavior: "smooth",
                                block:"center",
                            });
                        }}
                    >
                        {/* Home */}
                    </a>
                    <a
                        href="#section2"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementsById("section2").scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }}
                    >
                        {/* Get Started */}
                    </a>
                    <a
                        href="#section3"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("section3").scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }}
                    >
                        {/* About */}
                    </a>
                </div>
            </div>
        </>
    );
}

export default LandingScreen;