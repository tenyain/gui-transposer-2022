import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";

/* Firebase assets */
import { database } from "../../../firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* actions */
import {
  sendSongTitle,
  sendArtistName,
  sendCapoFret,
  sendSongTuning,
  sendSongKey,
} from "../../../store/currentSongInfoSlice";
import { setStartLoading, setStopLoading } from "../../../store/generalSlice";
import { setCloseAlert } from "../../../store/alertBoxSlice";
import {
  setIsPersonalBoard,
  setIsPublicBoard,
} from "../../../store/generalSlice";

/* Custom Hook */
import HookFirebaseAssets from "../../../hook.firebaseAssets";

/* Context */
import { AlertContext } from "../../../util/AlertContext";

const Hook = (formSubmit, currentBoard, inputLyric, setInputLyric, boardId) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { handleCallAlert, handleCallAlertBox } = useContext(AlertContext);

  const userId = localStorage.getItem("gui-userId");
  let userIdTemp;
  const isAdmin = localStorage.getItem("interactingAdmin");

  const [currentBoardWithId, setCurrentBoardWithId] = useState(null);
  const [isNewBoard, setIsNewBoard] = useState(true);
  const [capoOnFret, setCapoOnFret] = useState(0);
  const [songTuning, setSongTuning] = useState(0);
  const [songKey, setSongKey] = useState(0);

  const {
    publicBoardsCollection,
    fetchPublicBoardList,
    fetchPersonalBoardList,
    personalBoardsCollection,
  } = HookFirebaseAssets();

  const dispatch = useDispatch();

  useEffect(() => {
    location.pathname.includes("my")
      ? dispatch(setIsPersonalBoard())
      : dispatch(setIsPublicBoard());
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm();

  const { isPersonal } = useSelector((state) => state.general);

  const { songTitle, artistName, songInputLyric, capoFret, tuning, key } =
    useSelector((state) => state.currentSongInfo);

  const currentInputtedLyric = currentBoardWithId?.lyricInput?.join("\n");
  const inputtedPublicLyric = inputLyric.split("\n");

  const onSubmit = (data, e) => {
    formSubmit(e);

    dispatch(sendSongTitle(data.songTitle));
    dispatch(sendArtistName(data.artistName));
    dispatch(sendCapoFret(capoOnFret));
    dispatch(sendSongTuning(songTuning));
    dispatch(sendSongKey(songKey));
  };

  const megaFormSubmit = handleSubmit(onSubmit);

  useEffect(() => {
    if (!isPersonal) {
      if (boardId.length > 4 && songInputLyric.length === 0) {
        dispatch(setStartLoading());
        getDocs(publicBoardsCollection)
          .then((item) => {
            let currentBoardWithIdRef = item.docs.filter((board) => {
              return board.id === boardId;
            });

            let toStateRef = currentBoardWithIdRef.map((item) => item.data());

            setCurrentBoardWithId(toStateRef[0]);
            dispatch(setStopLoading());
          })
          .catch((err) => {
            alert(err.message);
            dispatch(setStopLoading());
          });
        setIsNewBoard(false);
      } else if (boardId.length > 4) {
        setIsNewBoard(false);
      } else {
        setIsNewBoard(true);
      }
    } else {
      userIdTemp = localStorage.getItem("gui-userId");
      let personalBoardsCollectionTemp = collection(
        database,
        `gui-users/${userIdTemp}/boards`
      );
      // && songInputLyric.length === 0)
      if (boardId.length > 4 && songInputLyric.length === 0) {
        dispatch(setStartLoading());
        getDocs(personalBoardsCollectionTemp)
          .then((item) => {
            let currentBoardWithIdRef = item.docs.filter((board) => {
              return board.id === boardId;
            });

            let toStateRef = currentBoardWithIdRef.map((item) => item.data());

            setCurrentBoardWithId(toStateRef[0]);
            dispatch(setStopLoading());
          })
          .catch((err) => {
            alert(err.message);
            dispatch(setStopLoading());
          });
        setIsNewBoard(false);
      } else if (boardId.length > 4) {
        setIsNewBoard(false);
      } else {
        setIsNewBoard(true);
      }
    }
  }, [isPersonal]);

  const isFormsEmpty = () => {
    if (
      watch("songTitle") === "" ||
      watch("artistName") === "" ||
      inputLyric === ""
    ) {
      return true;
    } else {
      return false;
    }
  };

  //#region -- Managing CRUD Public board for admins
  const handleAddingBoardList = () => {
    let isInComplete = isFormsEmpty();
    if (!isInComplete) {
      if (isAdmin) {
        addDoc(publicBoardsCollection, {
          songTitle: watch("songTitle"),
          artistName: watch("artistName"),
          lyricInput: inputtedPublicLyric,
          capoFret: capoOnFret === undefined ? 0 : capoOnFret,
          tuning: songTuning === undefined ? "Standard" : songTuning,
          key : songKey === undefined ? "---" : songKey,
          createdAt: serverTimestamp(),
        })
          .then(() => {
            handleCallAlert("Added to Public boards.", "success");
            fetchPublicBoardList(true);
            navigate("/");
          })
          .catch((err) => {
            alert(err.message);
          });
      }
    } else {
      handleCallAlert("Data is incomplete.", "danger");
    }
  };

  const handleDeletingBoard = () => {
    // dispatch(setStartLoading());
    deleteDoc(doc(database, "public-boards", boardId))
      .then(() => {
        fetchPublicBoardList(true);
        handleCallAlert("Deleted Public board.", "info");
        navigate("/");
        // alert("Board is deleted");
      })
      .catch((err) => alert(err.message));
  };

  const handleUpdatingBoard = () => {
    dispatch(setStartLoading());
    updateDoc(doc(database, "public-boards", boardId), {
      songTitle: watch("songTitle"),
      artistName: watch("artistName"),
      lyricInput: inputtedPublicLyric,
      capoFret: capoOnFret === undefined ? 0 : capoOnFret,
      tuning: songTuning === undefined ? "Standard" : songTuning,
      key : songKey === undefined ? "---" : songKey,
      createdAt: serverTimestamp(),
    })
      .then(() => {
        dispatch(setCloseAlert());
        handleCallAlert("Updated Public board.", "info");
        dispatch(setStopLoading());
      })
      .catch((err) => {
        dispatch(setStopLoading());
        alert(err.message);
      });
  };
  //#endregion

  //#region -- Managing CRUD for personal board
  const handleAddingPersonalBoardList = () => {
    let isInComplete = isFormsEmpty();
    if (!isInComplete) {
      userIdTemp = localStorage.getItem("gui-userId");
      let personalBoardsCollectionTemp = collection(
        database,
        `gui-users/${userIdTemp}/boards`
      );
      addDoc(personalBoardsCollectionTemp, {
        songTitle: watch("songTitle"),
        artistName: watch("artistName"),
        lyricInput: inputtedPublicLyric,
        capoFret: capoOnFret === undefined ? 0 : capoOnFret,
        tuning: songTuning === undefined ? "Standard" : songTuning,
        key : songKey === undefined ? "---" : songKey,
        createdAt: serverTimestamp(),
      })
        .then(() => {
          handleCallAlert("Added to library.", "success");
          fetchPersonalBoardList(true);
          navigate("/profile");
        })
        .catch((err) => {
          alert(err.message);
        });
    } else {
      handleCallAlert("Data is incomplete.", "danger");
    }
  };

  const handleDeletingPersonalBoard = () => {
    userIdTemp = localStorage.getItem("gui-userId");
    deleteDoc(doc(database, `gui-users/${userIdTemp}/boards`, boardId))
      .then(() => {
        fetchPersonalBoardList(true);
        dispatch(setCloseAlert());
        handleCallAlert("Deleted board.", "info");
        navigate("/profile");
      })
      .catch((err) => alert(err.message));
  };

  const handleUpdatingPersonalBoard = () => {
    const abortAction = isFormsEmpty();

    if (!abortAction) {
      const userIdTemp = localStorage.getItem("gui-userId");
      dispatch(setStartLoading());
      updateDoc(doc(database, `gui-users/${userIdTemp}/boards`, boardId), {
        songTitle: watch("songTitle"),
        artistName: watch("artistName"),
        lyricInput: inputtedPublicLyric,
        capoFret: capoOnFret === undefined ? 0 : capoOnFret,
        tuning: songTuning === undefined ? "Standard" : songTuning,
        key : songKey === undefined ? "---" : songKey,
        createdAt: serverTimestamp(),
      })
        .then(() => {
          dispatch(setCloseAlert());
          handleCallAlert("Updated board.", "info");
          dispatch(setStopLoading());
        })
        .catch((err) => {
          dispatch(setStopLoading());
          alert(err.message);
        });
    } else {
      dispatch(setCloseAlert());
      handleCallAlert("Please fill form completely.", "danger");
    }
  };
  //#endregion

  let formSongTitle = songTitle ? songTitle : currentBoardWithId?.songTitle;
  let formArtistName = artistName ? artistName : currentBoardWithId?.artistName;
  let formSongInputLyric = currentInputtedLyric
    ? currentInputtedLyric
    : inputLyric;
  let formCapoFret = capoFret ? capoFret : currentBoardWithId?.capoFret;
  let formSongTuning = tuning ? tuning : currentBoardWithId?.tuning;
  let formKey = key ? key : currentBoardWithId?.key;

  useEffect(() => {
    setValue("songTitle", formSongTitle);
    setValue("artistName", formArtistName);
    setCapoOnFret(formCapoFret);
    setSongTuning(formSongTuning);
    setInputLyric(formSongInputLyric);
    setSongKey(formKey)
  }, [currentInputtedLyric, currentBoardWithId]);

  return {
    register,
    errors,
    watch,
    trigger,
    setValue,
    currentInputtedLyric,
    formSongTitle,
    formArtistName,
    formCapoFret,
    isNewBoard,
    isAdmin,
    isPersonal,
    capoOnFret,
    songTuning,
    songKey,
    /* action */
    megaFormSubmit,
    handleAddingBoardList,
    handleDeletingBoard,
    handleUpdatingBoard,
    handleCallAlertBox,

    handleAddingPersonalBoardList,
    handleDeletingPersonalBoard,
    handleUpdatingPersonalBoard,

    setCapoOnFret,
    setSongTuning,
    setSongKey,
  };
};

export default Hook;
