import { createSlice } from "@reduxjs/toolkit";

export const currentSongInfoSlice = createSlice({
    name : 'currentSongInfo',
    initialState : {
        songTitle : '',
        artistName : '',
        detectedChords : [],
        transposedChords : [],
        capoFret : 0,
        key : '',
        tuning : '0',
        songInputLyric : []
    },
    reducers : {
        sendSongTitle : (state, action) => {
            state.songTitle = action.payload
        },
        sendArtistName : (state, action) => {
            state.artistName = action.payload
        },
        sendSongDetectedChords : (state, action) => {
            state.detectedChords = [...action.payload];
        },
        sendSongTransposedChords : (state, action) => {
            state.transposedChords = [...action.payload]
        },
        sendCapoFret : (state, action) => {
            state.capoFret = action.payload;
        },
        sendSongKey : (state, action) => {
            state.key = action.payload;
        },
        sendSongTuning : (state, action) => {
            state.key = action.payload
        },
        sendSongInputLyric : (state, action) => {
            state.songInputLyric = [...action.payload]
        }
    }
})

export const { sendSongTitle, sendArtistName, sendSongDetectedChords, sendSongTransposedChords, sendCapoFret, sendSongKey, sendSongTuning, sendSongInputLyric } = currentSongInfoSlice.actions;
export default currentSongInfoSlice.reducer;