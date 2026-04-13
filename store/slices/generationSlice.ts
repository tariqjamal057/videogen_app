import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GenerationState {
  currentPrompt: string;
}

const initialState: GenerationState = {
  currentPrompt: "",
};

const generationSlice = createSlice({
  name: "generation",
  initialState,
  reducers: {
    setPrompt(state, action: PayloadAction<string>) {
      state.currentPrompt = action.payload;
    },
    clearPrompt(state) {
      state.currentPrompt = "";
    },
  },
});

export const { setPrompt, clearPrompt } = generationSlice.actions;
export const selectCurrentPrompt = (state: any) =>
  state.generation.currentPrompt;
export default generationSlice.reducer;
