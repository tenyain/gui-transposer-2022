import React from "react";
import { Link } from "react-router-dom";

import { HeroGui } from "../../assets";

const HeroSection = () => {
  return (
    <section className="flex flex-col-reverse lg:flex-row justify-center items-center min-h-[500px] mb-10">
      <div className="flex-1 flex justify-center items-center lg:items-start flex-col gap-4">
        <h1 className="font-secondary text-center lg:text-left text-[2.3rem] lg:text-[3rem] font-bold text-dark">Transpose <span className="text-light-md">
        Chords</span>  and sing along with <span className="text-light-md">lyrics</span>.</h1>

        <Link to="/sign-in">
            <button className="primary-btn--info text-xl px-10">
                Sign In
            </button>
        </Link>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <img width={500} height={430.73} className="w-[500px]" src={HeroGui} alt="man with guitar" />
      </div>
    </section>
  );
};

export default HeroSection;
