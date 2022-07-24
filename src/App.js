import React, { useState, useEffect } from "react";
import "./App.css";
import { uniq, last, indexOf } from "lodash";
import parse from "html-react-parser";

import {
  ChordRegexOp,
  chords_Arr_i,
  chords_Arr_ii,
  chords_Arr_i_regex,
  chords_Arr_ii_regex,
  chords_Arr_Regex,
} from "./constants";

const LyricLine = ({
  line,
  lyricBoard,
  transposeLvl,
  detectedChords,
  transposedChords,
}) => {
  const spacedLine = line + " ";
  const [matchesPos, setMatchesPos] = useState([]);
  const [locateChord, setLocateChord] = useState("");

  useEffect(() => {
    if (line.trim().length !== 0) {
      let matches;
      let matchesPosArr = [];
      while ((matches = ChordRegexOp.exec(spacedLine)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (matches.index === ChordRegexOp.lastIndex) {
          ChordRegexOp.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        matches.forEach((match, groupIndex) => {
          matchesPosArr.push({
            matchChord: match,
            startPos: matches.index,
            endPos: ChordRegexOp.lastIndex,
          });
        });
      }
      setMatchesPos(matchesPosArr);
    }
  }, [lyricBoard]);

  useEffect(() => {
    if (matchesPos.length > 0) {
      let mergingLine = [];
      let mappedChords = matchesPos.map((item, index) => {
        if (transposeLvl === 0) {
          if (index === 0) {
            mergingLine.push(
              spacedLine.replace(
                item.matchChord,
                `<span class="chord">${item.matchChord.trim()}</span>`
              )
            );
            return spacedLine.replace(
              item.matchChord,
              `<span class="chord">${item.matchChord.trim()}</span>`
            );
          } else {
            // console.log({mergedLINE :mergingLine[index-1]});
            mergingLine.push(
              mergingLine[index - 1].replace(
                item.matchChord,
                `<span class="chord">${item.matchChord.trim()}</span>`
              )
            );
            return mergingLine[index - 1].replace(
              item.matchChord,
              `<span class="chord">${item.matchChord.trim()}</span>`
            );
          }
        } else {
          let chordInLine = item.matchChord.trim();
          let transposedChordInLine = transposedChords[detectedChords.indexOf(chordInLine)]
          if (index === 0) {
            mergingLine.push(
              spacedLine.replace(
                item.matchChord,
                `<span class="chord">${transposedChordInLine}</span>`
              )
            );
            return spacedLine.replace(
              item.matchChord,
              `<span class="chord">${transposedChordInLine}</span>`
            );
          } else {
            // console.log({mergedLINE :mergingLine[index-1]});
            mergingLine.push(
              mergingLine[index - 1].replace(
                item.matchChord,
                `<span class="chord">${transposedChordInLine}</span>`
              )
            );
            return mergingLine[index - 1].replace(
              item.matchChord,
              `<span class="chord">${transposedChordInLine}</span>`
            );
          }
        }
      });

      setLocateChord(last(mappedChords));
    }
  }, [matchesPos, transposeLvl, transposedChords]);

  // matchesPos.length >0 && console.log({matchesPos})
  // console.log({locateChord})
  return (
    <>
      {line.trim().length !== 0 && (
        <div className={`lyric-line ${matchesPos.length > 0 && "chord-line"}`}>
          {matchesPos.length > 0 ? parse(locateChord) : line}
        </div>
      )}
    </>
  );
};

const App = () => {
  const [inputLyric, setInputLyric] = useState("");
  const [lyricBoard, setLyricBoard] = useState([]);
  const [detectedChords, setDetectedChords] = useState([]);
  const [transposedChords, setTransposedChords] = useState([]);
  const [transposeLvl, setTransposeLvl] = useState(0);
  const [matchesPos, setMatchesPos] = useState([]);

  useEffect(() => {
    let matches;
    let detectedChordsArr = [];
    let matchesPosArr = [];
    while ((matches = ChordRegexOp.exec(lyricBoard)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === ChordRegexOp.lastIndex) {
        ChordRegexOp.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      matches.forEach((match, groupIndex) => {
        detectedChordsArr.push(match.trim());
        // console.log({
        //   matchChord: match,
        //   startPos: matches.index,
        //   endPos: ChordRegexOp.lastIndex,
        // });
        matchesPosArr.push({
          matchChord: match,
          startPos: matches.index,
          endPos: ChordRegexOp.lastIndex,
        });
        // console.log(`Found match, group ${groupIndex}: ${match}`);
      });
    }
    setMatchesPos(matchesPosArr);
    setDetectedChords(uniq(detectedChordsArr));
  }, [lyricBoard]);

  console.log({ matchesPos, detectedChords, transposedChords });

  const handleSubmit = (e) => {
    e.preventDefault();
    const linedLyric = inputLyric.split(/\r?\n/);
    // console.log(linedLyric);
    setLyricBoard(linedLyric);
    // console.log({ detectedChords });
  };

  const handleDownStrictLvl = (chordIndex, actionLvl) => {
    // console.log(`${chordIndex} + ${actionLvl}`);

    if (chordIndex + actionLvl >= 0) {
      return chordIndex + actionLvl;
    } else {
      return 12 + (chordIndex + actionLvl);
    }
  };

  const handleUpStrictLvl = (chordIndex, actionLvl) => {
    // console.log({ chordIndex, actionLvl });
    if (chordIndex + actionLvl <= 11) {
      return chordIndex + actionLvl;
    } else {
      return -(12 - (chordIndex + actionLvl));
    }
  };

  useEffect(() => {
    let transposedChordArr = [];
    if (transposeLvl <= -1) {
      detectedChords.map((chord) => {
        if (
          12 + (chords_Arr_i.indexOf(chord) + transposeLvl) ===
          chords_Arr_i.indexOf(chord)
        ) {
          setTransposeLvl(-1);
        }
        if (chords_Arr_i.indexOf(chord) !== -1) {
          let indexDown = handleDownStrictLvl(
            chords_Arr_i.indexOf(chord),
            transposeLvl
          );

          transposedChordArr.push(chords_Arr_i[indexDown]);
          // console.log(
          //   `${chord} is down ${chords_Arr_i.indexOf(
          //     chord
          //   )} + ${transposeLvl} ,${indexDown},  ${chords_Arr_i[indexDown]} `
          // );
        }

        if (chords_Arr_ii.indexOf(chord) !== -1) {
          let indexDown = handleDownStrictLvl(
            chords_Arr_ii.indexOf(chord),
            transposeLvl
          );
          transposedChordArr.push(chords_Arr_ii[indexDown]);
          // console.log(
          //   `${chord} is down ${chords_Arr_ii.indexOf(
          //     chord
          //   )} + ${transposeLvl} ,${indexDown},  ${chords_Arr_ii[indexDown]} `
          // );
        }
      });
    } else {
      detectedChords.map((chord) => {
        if (
          -(12 - (chords_Arr_i.indexOf(chord) + transposeLvl)) ===
          chords_Arr_i.indexOf(chord)
        ) {
          setTransposeLvl(1);
        }
        if (chords_Arr_i.indexOf(chord) !== -1) {
          let indexUp = handleUpStrictLvl(
            chords_Arr_i.indexOf(chord),
            transposeLvl
          );
          transposedChordArr.push(chords_Arr_i[indexUp]);
          // console.log(
          //   `${chord} is up ${chords_Arr_i.indexOf(
          //     chord
          //   )} + ${transposeLvl} ,${indexUp},  ${chords_Arr_i[indexUp]} `
          // );
        }

        if (chords_Arr_ii.indexOf(chord) !== -1) {
          let indexUp = handleUpStrictLvl(
            chords_Arr_ii.indexOf(chord),
            transposeLvl
          );
          transposedChordArr.push(chords_Arr_ii[indexUp]);
          // console.log(
          //   `${chord} is up ${chords_Arr_ii.indexOf(
          //     chord
          //   )} + ${transposeLvl} ,${indexUp},  ${chords_Arr_ii[indexUp]} `
          // );
        }
      });
    }
    setTransposedChords(transposedChordArr);
  }, [transposeLvl]);

  const handleTransposeUp = () => {
    setTransposeLvl((prev) => prev + 1);
  };

  const handleTransposeDown = () => {
    setTransposeLvl((prev) => prev - 1);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <textarea
          className="lyric-input"
          value={inputLyric}
          onChange={(e) => {
            setInputLyric(e.target.value);
          }}
          name=""
          id=""
          cols="30"
          rows="10"
        ></textarea>

        <button className="lyric-genBtn">Generate</button>
      </form>

      <section className="transposer">
        {transposedChords.length > 0 && transposeLvl !== 0 ? (
          <div className="transposed-chords">
            {transposedChords.length > 0 &&
              transposedChords.map((chord) => {
                return <p key={chord}>{chord}</p>;
              })}
          </div>
        ) : (
          <div className="detected-chords">
            {detectedChords.length > 0 &&
              detectedChords.map((chord) => {
                return <p key={chord}>{chord}</p>;
              })}
          </div>
        )}

        <div className="transpose-btn">
          <button onClick={handleTransposeDown}>-</button>
          <button onClick={() => setTransposeLvl(0)}>Reset</button>
          <button onClick={handleTransposeUp}>+</button>
        </div>
        <h1>{transposeLvl}</h1>
      </section>

      {/* <pre className="lyric-board">{parse(lyricBoard.replace(/Em/g, `<span class='chord'>Em</span>`))}</pre> */}
      <pre className="lyric-board">
        {/* {console.log({ lyricBoard })} */}
        {lyricBoard.length > 0 &&
          lyricBoard.map((line, index) => {
            return (
              <LyricLine
                key={index}
                line={line}
                lyricBoard={lyricBoard}
                transposeLvl={transposeLvl}
                detectedChords={detectedChords}
                transposedChords={transposedChords}
              />
            );
          })}
      </pre>
    </>
  );
};

export default App;
