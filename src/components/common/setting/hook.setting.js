import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import * as Scroll from "react-scroll";
import { useDispatch } from "react-redux";

/* action */
import { sendToggleChordBoard } from "../../../store/mainGenSlice";

const Hook = (printRef, speedOfScroll, selected, setSelected) => {

  const dispatch = useDispatch();

  const handleDownloadImage = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);

    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = "image.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  const [scrollSpeed, setScrollSpeed] = useState(50000);

  let ScrollLink = Scroll.Link;

  useEffect(() => {
    let selectedSpeed = speedOfScroll.filter((speed) => {
      return speed.name === selected;
    });
    setScrollSpeed(selectedSpeed[0].speed);
  }, [selected, speedOfScroll]);

  // console.log({ selected, scrollSpeed });

  const handleToggleChordBoard = () => {
    dispatch(sendToggleChordBoard())
  }

  return {
    scrollSpeed,
    ScrollLink,
    /* actions */
    setScrollSpeed,
    handleDownloadImage,
    handleToggleChordBoard
  };
};

export default Hook;
