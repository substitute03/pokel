import { BehaviorSubject } from 'rxjs';
import { Guess } from './guess';
import { generationService } from '../services/generationService';
import { GameState, ArrowNavigationResult, RightArrowNavigationResult, BackspaceResult, DeleteResult, ValidCharacterResult, EnterResult, GuessResult } from '../interfaces/game';
import { PokemonService } from 'src/services/pokemon.service';

export class Game {
    public gameState: GameState;
    private generationService = new generationService();

    // Observable state for reactive updates
    public targetName$: BehaviorSubject<string[]>;
    public targetSprite$: BehaviorSubject<string | null>;
    public targetPokedexEntry$: BehaviorSubject<string | null>;
    public targetPokemonNumber$: BehaviorSubject<number | null>;
    public guesses$: BehaviorSubject<Guess[]>;

    constructor(private pokemonService: PokemonService) {
        this.gameState = {
            pokemon: [],
            generations: [1],
            targetName: [],
            targetNameString: "",
            guesses: [],
            guessNumber: 1,
            hasFoundWord: false,
            gameOver: false,
            focussedLetterIndex: null,
            focussedGuessIndex: null,
            evaluatingGuess: false
        };

        this.targetName$ = new BehaviorSubject<string[]>([]);
        this.guesses$ = new BehaviorSubject<Guess[]>([]);
        this.targetSprite$ = new BehaviorSubject<string | null>(null);
        this.targetPokedexEntry$ = new BehaviorSubject<string | null>(null);
        this.targetPokemonNumber$ = new BehaviorSubject<number | null>(null);
    }

    // Getters for component access
    get pokemon(): string[] { return this.gameState.pokemon; }
    get generations(): number[] { return this.gameState.generations; }
    get targetNameString(): string { return this.gameState.targetNameString; }
    get guessNumber(): number { return this.gameState.guessNumber; }
    get hasFoundWord(): boolean { return this.gameState.hasFoundWord; }
    get gameOver(): boolean { return this.gameState.gameOver; }
    get focussedLetterIndex(): number | null { return this.gameState.focussedLetterIndex; }
    get focussedGuessIndex(): number | null { return this.gameState.focussedGuessIndex; }
    get evaluatingGuess(): boolean { return this.gameState.evaluatingGuess; }
    get targetSprite(): string | null { return this.targetSprite$.value; }
    get targetPokemonNumber(): number | null { return this.targetPokemonNumber$.value; }
    get targetPokedexEntry(): string | null { return this.targetPokedexEntry$.value; }

    // Setters for component access
    set focussedLetterIndex(value: number | null) { this.gameState.focussedLetterIndex = value; }
    set focussedGuessIndex(value: number | null) { this.gameState.focussedGuessIndex = value; }
    set evaluatingGuess(value: boolean) { this.gameState.evaluatingGuess = value; }

    public initializeGame(): void {
        this.resetGame();
    }

    public resetGame(): void {
        this.gameState.pokemon = this.generationService.getPokemonByGeneration(this.gameState.generations);
        this.gameState.targetName = this.getTargetName();
        this.gameState.targetNameString = this.gameState.targetName.filter(l => l !== "").map(l => l).join("");
        this.setInitialGuesses();
        this.gameState.guessNumber = 1;
        this.gameState.hasFoundWord = false;
        this.gameState.gameOver = false;
        this.gameState.evaluatingGuess = false;
        this.gameState.focussedGuessIndex = 0;
        this.gameState.focussedLetterIndex = 0;
        this.targetName$.next(this.gameState.targetName);
        this.getPokemonData();
    }

    public getPokemonData(): void {
        this.pokemonService.getPokemonByName(this.targetNameString)
            .then(pokemon => {
                this.targetSprite$.next(pokemon?.sprites?.other?.['official-artwork']?.front_default ?? null);
                this.targetPokemonNumber$.next(pokemon?.id ?? null);
            });

        this.pokemonService.getPokedexEntryByName(this.targetNameString)
            .then(entry => {
                this.targetPokedexEntry$.next(entry);
            });
    }

    public updateGenerations(generations: number[]): void {
        this.gameState.generations = generations;
        this.resetGame();
    }

    public toggleGeneration(generationNumber: number): boolean {
        // Don't allow deselecting the last generation
        if (this.gameState.generations.length === 1 && this.gameState.generations.includes(generationNumber)) {
            return false;
        }

        if (this.gameState.generations.includes(generationNumber)) {
            // Remove generation
            this.gameState.generations = this.gameState.generations.filter(g => g !== generationNumber);
        } else {
            // Add generation
            this.gameState.generations.push(generationNumber);
        }

        return true;
    }

    public resetToGen1(): void {
        this.gameState.generations = [1];
    }

    public getSelectedGenerationsText(): string {
        if (this.gameState.generations.length === 0) {
            return 'None';
        }

        const genTexts = this.gameState.generations.map(g => `${g}`);
        if (genTexts.length === 1) {
            return genTexts[0];
        } else if (genTexts.length === 2) {
            return genTexts.join(' & ');
        } else {
            const last = genTexts.pop();
            return genTexts.join(', ') + ' & ' + last;
        }
    }

    public canProcessInput(): boolean {
        return this.gameState.focussedGuessIndex !== null &&
            this.gameState.focussedLetterIndex !== null &&
            !this.gameState.hasFoundWord &&
            !this.gameState.evaluatingGuess;
    }

    public handleLeftArrow(): ArrowNavigationResult | null {
        if (this.gameState.focussedGuessIndex === null || this.gameState.focussedLetterIndex === null) {
            return null;
        }

        let newLetterIndex: number;

        if (this.gameState.focussedLetterIndex === -1) {
            newLetterIndex = this.gameState.targetNameString.length - 1;
        } else if (this.gameState.focussedLetterIndex === 0) {
            newLetterIndex = 0;
        } else {
            newLetterIndex = this.gameState.focussedLetterIndex - 1;
        }

        return {
            newGuessIndex: this.gameState.focussedGuessIndex,
            newLetterIndex: newLetterIndex
        };
    }

    public handleRightArrow(): RightArrowNavigationResult | null {
        if (this.gameState.focussedGuessIndex === null || this.gameState.focussedLetterIndex === null) {
            return null;
        }

        let newLetterIndex: number;
        let shouldBlur = false;

        if (this.gameState.focussedLetterIndex === -1) {
            newLetterIndex = -1;
        } else if (this.gameState.focussedLetterIndex === this.gameState.targetNameString.length - 1) {
            newLetterIndex = -1;
            shouldBlur = true;
        } else {
            newLetterIndex = this.gameState.focussedLetterIndex + 1;
        }

        return {
            newGuessIndex: this.gameState.focussedGuessIndex,
            newLetterIndex: newLetterIndex,
            navigatedPastFinalBox: shouldBlur
        };
    }

    public handleBackspace(): BackspaceResult | null {
        if (this.gameState.focussedGuessIndex === null || this.gameState.focussedLetterIndex === null) {
            return null;
        }

        let deletedIndex: number;
        let newLetterIndex: number;

        if (this.gameState.focussedLetterIndex === -1) {
            deletedIndex = this.gameState.targetName.length - 1;
            newLetterIndex = this.gameState.targetName.length - 1;
        } else {
            deletedIndex = this.gameState.focussedLetterIndex - 1;
            newLetterIndex = this.gameState.focussedLetterIndex - 1;
        }

        if (deletedIndex === -1) {
            return null;
        }

        // Delete the letter
        const guessToUpdate = this.gameState.guesses
            .find(g => g.guessNumber === this.gameState.guessNumber);

        guessToUpdate?.letters[deletedIndex]?.deleteValue();

        return {
            deletedIndex: deletedIndex,
            newGuessIndex: this.gameState.focussedGuessIndex,
            newLetterIndex: newLetterIndex,
            shouldUpdateGuesses: true
        };
    }

    public handleDelete(): DeleteResult {
        const deletedIndex = this.gameState.focussedLetterIndex!;

        // Delete the letter
        const guessToUpdate = this.gameState.guesses
            .find(g => g.guessNumber === this.gameState.guessNumber);

        guessToUpdate?.letters[deletedIndex]?.deleteValue();

        return {
            deletedIndex: deletedIndex,
            shouldUpdateGuesses: true
        };
    }

    public handleValidCharacter(pressedKey: string): ValidCharacterResult {
        const guessToUpdate = this.gameState.guesses
            .find(g => g.guessNumber === this.gameState.guessNumber);

        // Set the letter value
        guessToUpdate?.letters[this.gameState.focussedLetterIndex!].setValue(pressedKey);

        // Check if at the last index
        const isLastLetter = this.gameState.focussedLetterIndex === this.gameState.targetName.length - 1;

        if (isLastLetter) {
            return {
                success: true,
                newGuessIndex: this.gameState.focussedGuessIndex!,
                newLetterIndex: -1,
                isLastLetter: true,
                shouldUpdateGuesses: true
            };
        } else {
            return {
                success: true,
                newGuessIndex: this.gameState.focussedGuessIndex!,
                newLetterIndex: this.gameState.focussedLetterIndex! + 1,
                isLastLetter: false,
                shouldUpdateGuesses: true
            };
        }
    }

    public handleEnter(): EnterResult {
        const currentGuess = this.getCurrentGuess();

        if (!currentGuess) {
            return {
                isValidPokemon: false,
                currentGuess: null,
                isValidGuess: false
            };
        }

        const validPokemonList: string[] = this.generationService.getAllPokemon();
        if (validPokemonList.includes(currentGuess.getValue().toUpperCase())) {
            // Valid Pokemon - evaluate the guess
            currentGuess.evaluateGuess();

            return {
                isValidPokemon: true,
                currentGuess: currentGuess,
                isValidGuess: true
            };
        } else {
            // Invalid Pokemon
            return {
                isValidPokemon: false,
                currentGuess: currentGuess,
                isValidGuess: false
            };
        }
    }

    public handleGuessResult(currentGuess: Guess): GuessResult {
        if (currentGuess.isCorrect) {
            this.gameState.hasFoundWord = true;
            this.gameState.gameOver = true;
            this.gameState.evaluatingGuess = false;

            return {
                gameState: 'correct',
                shouldUpdateFocus: false,
                newGuessIndex: this.gameState.focussedGuessIndex!,
                newLetterIndex: this.gameState.focussedLetterIndex!
            };
        } else if (this.isFinalGuess()) {
            // Ensure final guess is properly evaluated for display
            currentGuess.evaluateGuess();
            this.gameState.gameOver = true;
            this.gameState.evaluatingGuess = false;

            return {
                gameState: 'final',
                shouldUpdateFocus: false,
                newGuessIndex: this.gameState.focussedGuessIndex!,
                newLetterIndex: this.gameState.focussedLetterIndex!
            };
        } else {
            // Move to next guess
            this.gameState.guessNumber++;
            this.gameState.focussedGuessIndex = this.gameState.focussedGuessIndex! + 1;
            this.gameState.focussedLetterIndex = 0;
            this.gameState.evaluatingGuess = false;

            return {
                gameState: 'continue',
                shouldUpdateFocus: true,
                newGuessIndex: this.gameState.focussedGuessIndex,
                newLetterIndex: this.gameState.focussedLetterIndex
            };
        }
    }

    public isValidCharacter(char: string): boolean {
        return /^[A-Za-z]$/.test(char);
    }

    private getTargetName(): string[] {
        const pokemon: string[] = this.generationService
            .getPokemonByGeneration(this.gameState.generations);

        const randomIndex: number = Math.floor(
            Math.random() * pokemon.length); // random index of the pokemon array

        const randomName: string = pokemon[randomIndex];

        let targetName: string[] = [];
        for (let i = 0; i < randomName.length; i++) {
            targetName.push(randomName.charAt(i).toUpperCase());
        }

        return targetName;
    }

    private getCurrentGuess(): Guess | null {
        return this.gameState.guesses.find(g => g.guessNumber === this.gameState.guessNumber) || null;
    }

    private setInitialGuesses(): void {
        const guesses: Guess[] = [];
        for (let i = 1; i <= 6; i++) {
            guesses.push(new Guess(this.gameState.targetName, i));
        }
        this.gameState.guesses = guesses;
        this.guesses$.next(guesses);
    }

    private isFinalGuess(): boolean {
        return this.gameState.guessNumber === 6;
    }
}
