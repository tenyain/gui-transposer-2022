import { useEffect, useState, useRef } from "react";
import { uniq } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { setStartLoading, setStopLoading } from "../../store/mainGenSlice";

/* Constants */
import {
  ChordRegexOp,
  chords_Arr_i,
  chords_Arr_ii,
  chords_Arr_iii
} from "../../constants/constants";

const Hook = () => {
  const [inputLyric, setInputLyric] = useState("");
  const [lyricBoard, setLyricBoard] = useState([]);
  const [detectedChords, setDetectedChords] = useState([]);
  const [transposedChords, setTransposedChords] = useState([]);
  const [transposeLvl, setTransposeLvl] = useState(0);
  const [matchesPos, setMatchesPos] = useState([]);
  const [editMode, setEditMode] = useState(true);

  const [formMessage, setFormMessage] = useState('');

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.mainGen)

  useEffect(() => {
    let matches;
    let detectedChordsArr = [];
    let matchesPosArr = []; /* Temp array to store match positions */
    while ((matches = ChordRegexOp.exec(lyricBoard)) !== null) {
      if (matches.index === ChordRegexOp.lastIndex) {
        ChordRegexOp.lastIndex++;
      }

      matches.forEach((match, groupIndex) => {
        if(match.length < 5) {
          detectedChordsArr.push(match.trim());
          matchesPosArr.push({
            matchChord: match,
            startPos: matches.index,
            endPos: ChordRegexOp.lastIndex,
          });
        }
      });
    }
    
    setMatchesPos(matchesPosArr);
    setDetectedChords(uniq(detectedChordsArr));
  }, [lyricBoard]);

  const textArea = useRef();
  const [selection, setSelection] = useState();

  useEffect(() => {
    /* Key combinations and cursor focus */
    if (!selection) return; // prevent running on start
    const { start, end } = selection;
    textArea.current.focus();
    textArea.current.setSelectionRange(start, end);
  }, [selection]);

  const handleCombineKey = (e) => {
    /* Ctrl + SPACE = Tab */
    if (e.ctrlKey && e.which === 32) {
      const start = textArea.current.selectionStart;
      const end = textArea.current.selectionEnd;

      let spacedIndex =
        inputLyric.slice(0, e.target.selectionStart) +
        "    " +
        inputLyric.slice(e.target.selectionStart);
      setSelection({
        start: start + 4,
        end: end + 4,
      });
      setInputLyric(spacedIndex);
    }
  };

  // console.log({ matchesPos, detectedChords, transposedChords, lyricBoard });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(inputLyric.trim().length !== 0){
      setFormMessage('')
      dispatch(setStartLoading())
      const linedLyric = inputLyric.split(/\r?\n/);
  
      const linedSpacedLyric = linedLyric.map((line) => {
        return line + " ";
      });
  
      setLyricBoard(linedSpacedLyric);
      setEditMode(false);
  
      setTimeout(() => {
        dispatch(setStopLoading())
      }, 1000);
    } else {
      setFormMessage('*Please drop a fancy chord.')
    }
  };

  //#region calculating up,down array index of transposed chords from chord arrays i,ii
  const handleDownStrictLvl = (chordIndex, actionLvl) => {
    if (chordIndex + actionLvl >= 0) {
      return chordIndex + actionLvl;
    } else {
      return 12 + (chordIndex + actionLvl);
    }
  };

  const handleUpStrictLvl = (chordIndex, actionLvl) => {
    if (chordIndex + actionLvl <= 11) {
      return chordIndex + actionLvl;
    } else {
      return -(12 - (chordIndex + actionLvl));
    }
  };
  //#endregion

  //#region calculating transposed chords
  useEffect(() => {
    let transposedChordArr = []; /* temporary array for transposed chords */
    if (transposeLvl <= -1) {
      detectedChords.map((chord) => {
        if (
          12 + (chords_Arr_i.indexOf(chord) + transposeLvl) ===
          chords_Arr_i.indexOf(chord)
        ) {
          setTransposeLvl(0);
        }
        if (chords_Arr_i.indexOf(chord) !== -1) {
          let indexDown = handleDownStrictLvl(
            chords_Arr_i.indexOf(chord),
            transposeLvl
          );

          transposedChordArr.push(chords_Arr_i[indexDown]);
        }

        if (chords_Arr_ii.indexOf(chord) !== -1) {
          let indexDown = handleDownStrictLvl(
            chords_Arr_ii.indexOf(chord),
            transposeLvl
          );
          transposedChordArr.push(chords_Arr_ii[indexDown]);
        }
        return true;
      });
    } else {
      detectedChords.map((chord) => {
        if (
          -(12 - (chords_Arr_i.indexOf(chord) + transposeLvl)) ===
          chords_Arr_i.indexOf(chord)
        ) {
          setTransposeLvl(0);
        }
        if (chords_Arr_i.indexOf(chord) !== -1) {
          let indexUp = handleUpStrictLvl(
            chords_Arr_i.indexOf(chord),
            transposeLvl
          );
          transposedChordArr.push(chords_Arr_i[indexUp]);
        }

        if (chords_Arr_ii.indexOf(chord) !== -1) {
          let indexUp = handleUpStrictLvl(
            chords_Arr_ii.indexOf(chord),
            transposeLvl
          );
          transposedChordArr.push(chords_Arr_ii[indexUp]);
        }
        return true;
      });
    }
    setTransposedChords(transposedChordArr);
  }, [transposeLvl, detectedChords]);

  //#endregion

  const handleTransposeUp = () => {
    setTransposeLvl((prev) => prev + 1);
  };

  const handleTransposeDown = () => {
    setTransposeLvl((prev) => prev - 1);
  };

  return {
    inputLyric,
    transposedChords,
    transposeLvl,
    detectedChords,
    lyricBoard,
    editMode,
    textArea,
    matchesPos,
    loading,
    formMessage,
    /* actions */
    setInputLyric,
    handleSubmit,
    setTransposeLvl,
    handleTransposeDown,
    handleTransposeUp,
    setEditMode,
    handleCombineKey,
    setFormMessage
  };
};

export default Hook;
