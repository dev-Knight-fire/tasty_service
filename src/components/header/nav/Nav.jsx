"use client";
import React, { useContext } from "react";
import NavLink from "./navLink/NavLink";
import styles from "./nav.module.css";
import PrimaryButton from "@/components/primaryButton/PrimaryButton";
import { NavContext } from "@/contexts/Nav";
import { useLang } from "@/contexts/LangContext";

// Import icons from react-icons
import { FaMap, FaInfoCircle, FaCogs, FaQuestionCircle, FaEnvelope } from "react-icons/fa";

const iconSize = 22; // Adjust this value for your preferred size

const Nav = () => {
  const { isMenuOpened, setIsMenuOpened } = useContext(NavContext);
  const { messages } = useLang();

  return (
    <nav
      onClick={() => setIsMenuOpened((prev) => !prev)}
      className={`${styles.nav} ${
        isMenuOpened && styles.navActive
      } flex gap-1 lg:gap-4 shadow lg:shadow-none dark:bg-slate-800 lg:dark:bg-transparent`}
    >
      <NavLink path="/map/all">
        <FaMap size={iconSize} className="inline mr-2 align-middle" />
        {messages['homeTitle']}
      </NavLink>

      <NavLink path="/about-us">
        <FaInfoCircle size={iconSize} className="inline mr-2 align-middle" />
        {messages['aboutusTitle']}
      </NavLink>

      <NavLink path="/services">
        <FaCogs size={iconSize} className="inline mr-2 align-middle" />
        {messages['termsofuseTitle']}
      </NavLink>

      <NavLink path="/faq">
        <FaQuestionCircle size={iconSize} className="inline mr-2 align-middle" />
        FAQ
      </NavLink>

      <div className="lg:hidden mt-10">
        <PrimaryButton>
          <FaEnvelope size={iconSize} className="inline mr-2 align-middle" />
          {messages['contactusTitle']}
        </PrimaryButton>
      </div>
    </nav>
  );
};

export default Nav;
