import { Guess } from "../domain/guess";

export interface GameState {
    pokemon: string[];
    generations: number[];
    targetName: string[];
    targetNameString: string;
    guesses: Guess[];
    guessNumber: number;
    hasFoundWord: boolean;
    gameOver: boolean;
    focussedLetterIndex: number | null;
    focussedGuessIndex: number | null;
    evaluatingGuess: boolean;
}

export interface ArrowNavigationResult {
    newGuessIndex: number;
    newLetterIndex: number;
}

export interface RightArrowNavigationResult extends ArrowNavigationResult {
    navigatedPastFinalBox: boolean;
}

export interface BackspaceResult {
    deletedIndex: number;
    newGuessIndex: number;
    newLetterIndex: number;
    shouldUpdateGuesses: boolean;
}

export interface DeleteResult {
    deletedIndex: number;
    shouldUpdateGuesses: boolean;
}

export interface ValidCharacterResult {
    success: boolean;
    newGuessIndex: number;
    newLetterIndex: number;
    isLastLetter: boolean;
    shouldUpdateGuesses: boolean;
}

export interface EnterResult {
    isValidPokemon: boolean;
    currentGuess: Guess | null;
    isValidGuess: boolean;
}

export interface GuessResult {
    gameState: 'correct' | 'final' | 'continue';
    shouldUpdateFocus: boolean;
    newGuessIndex: number;
    newLetterIndex: number;
}