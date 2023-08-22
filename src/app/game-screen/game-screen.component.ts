import { Component, ElementRef, OnInit, Query, ViewChild, Renderer2, HostListener } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Guess } from '../domain/guess';

@Component({
    selector: 'pok-game-screen',
    templateUrl: './game-screen.component.html',
    styleUrls: ['./game-screen.component.css',]
})
export class GameScreenComponent implements OnInit {

    pokemon: string[] = [
        "BULBASAUR", "IVYSAUR", "VENUSAUR", "CHARMANDER", "CHARMELEON", "CHARIZARD",
        "SQUIRTLE", "WARTORTLE", "BLASTOISE", "CATERPIE", "METAPOD", "BUTTERFREE",
        "WEEDLE", "KAKUNA", "BEEDRILL", "PIDGEY", "PIDGEOTTO", "PIDGEOT",
        "RATTATA", "RATICATE", "SPEAROW", "FEAROW", "EKANS", "ARBOK",
        "PIKACHU", "RAICHU", "SANDSHREW", "SANDSLASH", "NIDORAN", "NIDORINA",
        "NIDOQUEEN", "NIDORINO", "NIDOKING", "CLEFAIRY", "CLEFABLE",
        "VULPIX", "NINETALES", "JIGGLYPUFF", "WIGGLYTUFF", "ZUBAT", "GOLBAT",
        "ODDISH", "GLOOM", "VILEPLUME", "PARAS", "PARASECT", "VENONAT",
        "VENOMOTH", "DIGLETT", "DUGTRIO", "MEOWTH", "PERSIAN", "PSYDUCK",
        "GOLDUCK", "MANKEY", "PRIMEAPE", "GROWLITHE", "ARCANINE", "POLIWAG",
        "POLIWHIRL", "POLIWRATH", "ABRA", "KADABRA", "ALAKAZAM", "MACHOP",
        "MACHOKE", "MACHAMP", "BELLSPROUT", "WEEPINBELL", "VICTREEBEL", "TENTACOOL",
        "TENTACRUEL", "GEODUDE", "GRAVELER", "GOLEM", "PONYTA", "RAPIDASH",
        "SLOWPOKE", "SLOWBRO", "MAGNEMITE", "MAGNETON", "FARFETCHD", "DODUO",
        "DODRIO", "SEEL", "DEWGONG", "GRIMER", "MUK", "SHELLDER",
        "CLOYSTER", "GASTLY", "HAUNTER", "GENGAR", "ONIX", "DROWZEE",
        "HYPNO", "KRABBY", "KINGLER", "VOLTORB", "ELECTRODE", "EXEGGCUTE",
        "EXEGGUTOR", "CUBONE", "MAROWAK", "HITMONLEE", "HITMONCHAN", "LICKITUNG",
        "KOFFING", "WEEZING", "RHYHORN", "RHYDON", "CHANSEY", "TANGELA",
        "KANGASKHAN", "HORSEA", "SEADRA", "GOLDEEN", "SEAKING", "STARYU",
        "STARMIE", "MRMIME", "SCYTHER", "JYNX", "ELECTABUZZ", "MAGMAR",
        "PINSIR", "TAUROS", "MAGIKARP", "GYARADOS", "LAPRAS", "DITTO",
        "EEVEE", "VAPOREON", "JOLTEON", "FLAREON", "PORYGON", "OMANYTE",
        "OMASTAR", "KABUTO", "KABUTOPS", "AERODACTYL", "SNORLAX", "ARTICUNO",
        "ZAPDOS", "MOLTRES", "DRATINI", "DRAGONAIR", "DRAGONITE", "MEWTWO",
        "MEW"
    ];

    targetName$ = new BehaviorSubject<string[]>([]);
    guesses: Guess[] = [];
    guessNumber: number = 1;
    hasFoundWord: boolean = false;
    focussedLetterIndex: number | null = null;
    focussedGuessIndex: number | null = null;

    @ViewChild('letterBoxesRef', { read: ElementRef }) letterBoxesRef!: ElementRef;

    constructor() { }

    ngOnInit(): void {
        this.resetGame();
    }

    @HostListener('window:keydown', ['$event'])
    onWindowKeyDown(event: KeyboardEvent) {
        if (this.focussedGuessIndex === null || this.focussedLetterIndex === null) {
            return;
        }
        const pressedKey = event.key;
        let guessToUpdate: Guess | undefined = this.guesses
            .find(g => g.guessNumber === this.guessNumber);

        // Handle backspace
        if (pressedKey === "Backspace") {
            guessToUpdate?.letters[this.focussedLetterIndex]
                .deleteValue();

            this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex - 1);
        }

        // Handle enter
        else if (pressedKey === "Enter") {
            const currentGuess: Guess = this.getCurrentGuess();
            console.log(currentGuess.getValue().toUpperCase());

            if (currentGuess.lettersNotFilled === 0 && currentGuess.isCorrect) {
                this.hasFoundWord = true;
            }
            else if (this.pokemon.includes(currentGuess.getValue().toUpperCase())) {
                currentGuess.isCorrect; // This will evaluate the guess and set the letter match types.
                this.guessNumber++;
            }

        }

        // Handle valid key press
        else if (this.isValidCharacter(pressedKey)) {
            guessToUpdate?.letters[this.focussedLetterIndex]
                .setValue(pressedKey);

            this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex + 1)
        };
    }

    public focusLetterBox(guessIndex: number, letterIndex: number): void {
        const letterBoxElement = this.getLetterBoxElement(guessIndex, letterIndex);

        if (letterBoxElement) {
            // Remove focus from all letter boxes
            this.blurAllLetterBoxes();

            // Store the foccused guess and letter indexes
            this.focussedGuessIndex = guessIndex;
            this.focussedLetterIndex = letterIndex;

            // Set focus and highlight on the clicked letter box
            letterBoxElement.focus();
            letterBoxElement.classList.remove('border-secondary')
            letterBoxElement.classList.add('border-4');
            letterBoxElement.classList.add('border-dark');
        }
    }

    private blurAllLetterBoxes(): void {
        const letterBoxes = this.letterBoxesRef.nativeElement.querySelectorAll('.letter-box');
        letterBoxes.forEach((letterBox: HTMLElement) => {
            letterBox.blur();
            letterBox.classList.remove('border-dark')
            letterBox.classList.remove('border-4');
            letterBox.classList.add('border-secondary');
        });
    }

    private getLetterBoxElement(guessIndex: number, letterIndex: number): HTMLElement | null {
        const letterBoxId = `g${guessIndex}l${letterIndex}`;
        return this.letterBoxesRef.nativeElement.querySelector(`#${letterBoxId}`);
    }


    private getTargetName(): string[] {
        const randomIndex = Math
            .floor(Math.random() * this.pokemon.length);

        const randomName = this.pokemon[randomIndex];

        let targetName: string[] = [];

        for (let i = 0; i < randomName.length; i++) {
            targetName.push(randomName.charAt(i).toUpperCase());
        }

        return targetName;
    }

    private getCurrentGuess(): Guess {
        return this.guesses
            .find(g => g.guessNumber === this.guessNumber)!;
    }

    private setInitialGuesses(): void {
        for (let i = 1; i <= 6; i++) {
            this.guesses.push(new Guess(this.targetName$.value, i))
        }
    }

    private resetGame(): void {
        this.targetName$.next(this.getTargetName());
        this.setInitialGuesses();
        this.guessNumber = 1;

        // const startingInputElementToFocus = document
        //     .getElementById("1") as HTMLInputElement;

        // if (startingInputElementToFocus) {
        //     startingInputElementToFocus.focus();
        // }
    }

    private isValidCharacter(char: string): boolean {
        if (/^[A-Za-z]$/.test(char)) {
            return true;
        }

        return false;
    }

    private setFocusToPreviousElement(event: KeyboardEvent, currentInputElement: HTMLDivElement): void {
        // Prevent default browser button press behaviour just in case.
        event.preventDefault();

        // Get the current input element's ID.
        const currentElementId = currentInputElement.id;

        // Extract the index from the ID.
        const currentIndex =
            parseInt(currentElementId.slice(1));

        // If there's a previous input element, set focus to it.
        if (currentIndex > 0) {
            const previousElementId = "letter" + (currentIndex - 1).toString();

            const previousInputElement = document
                .getElementById(previousElementId) as HTMLInputElement;

            if (previousInputElement) {
                previousInputElement.focus();
            }
        }
    }

    private setFocusToNextElement(event: KeyboardEvent, currentInputElement: HTMLDivElement): void {
        // Prevent default browser button press behaviour just in case.
        event.preventDefault();

        // Get the current input element's ID.
        const currentElementId = currentInputElement.id;

        // Extract the index from the ID.
        const currentIndex =
            parseInt(currentElementId.slice(0, 1));

        // If there's a next input element, set focus to it.
        if (currentIndex > 0) {
            const nextElementId = "letter" + (currentIndex + 1).toString();

            const nextInputElement = document
                .getElementById(nextElementId) as HTMLInputElement;

            if (nextInputElement) {
                nextInputElement.focus();
            }
        }
    }

    private isRealPokemon(): boolean {


        return false;
    }
}
