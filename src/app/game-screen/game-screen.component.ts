import { Component, ElementRef, OnInit, Query, ViewChild, Renderer2, HostListener } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Guess } from '../domain/guess';

@Component({
    selector: 'pok-game-screen',
    templateUrl: './game-screen.component.html',
    styleUrls: ['./game-screen.component.css',]
})
export class GameScreenComponent implements OnInit {

    gen1Pokemon: string[] = [
        "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
        "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
        "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
        "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok",
        "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran", "Nidorina",
        "Nidoqueen", "Nidorino", "Nidoking", "Clefairy", "Clefable",
        "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat",
        "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat",
        "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck",
        "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
        "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop",
        "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
        "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash",
        "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetchd", "Doduo",
        "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder",
        "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee",
        "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute",
        "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung",
        "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela",
        "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu",
        "Starmie", "MrMime", "Scyther", "Jynx", "Electabuzz", "Magmar",
        "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto",
        "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte",
        "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno",
        "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo",
        "Mew"
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

        // Handle valid key press
        if (this.isValidCharacter(pressedKey)) {
            guessToUpdate?.letters[this.focussedLetterIndex]
                .setValue(pressedKey);

            this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex + 1)
        };

        // Handle enter

    }

    // public onKeyDown(event: Event, gIndex: number, lIndex: number): void {
    //     const enteredCharacter: string = (event as KeyboardEvent).key;

    //     let guessToUpdate = this.guesses
    //         .find(g => g.guessNumber === this.guessNumber);

    //     if (enteredCharacter === "Backspace") {
    //         // else if backspace was pressed, remove the last Letter.
    //         guessToUpdate?.removeLastLetter();
    //         this.onLetterBoxClick(gIndex, lIndex - 1);
    //         // this.setFocusToPreviousElement(event, currentInputElement);
    //     }
    //     else if (enteredCharacter === "Enter") {
    //         this.checkIfGuessIsCorrect();
    //     }
    //     // If the character is valid, add the Letter to the Guess.
    //     else if (this.isValidCharacter(enteredCharacter)) {
    //         guessToUpdate?.addLetter(enteredCharacter, lIndex);

    //         this.onLetterBoxClick(gIndex, lIndex);

    //         // if (setFocusToElement){
    //         //     setFocusToElement.focus();
    //         // }
    //         // this.setFocusToNextElement(event, currentInputElement);

    //         // if (this.isGuessCorrect() === true) {
    //         //     this.hasFoundWord = true;
    //         // }
    //     }

    // }

    // public onInputClick(event: MouseEvent, clickedInputElement: HTMLDivElement): void {
    //     const clickedElementId: number = +clickedInputElement.id;
    //     if (clickedElementId) {
    //         const clickedElement: HTMLElement | null = document
    //             .getElementById(clickedElementId.toString());

    //         if (clickedElement) {
    //             clickedElement.focus();
    //         }
    //     }
    // }


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
            .floor(Math.random() * this.gen1Pokemon.length);

        const randomName = this.gen1Pokemon[randomIndex];

        let targetName: string[] = [];

        for (let i = 0; i < randomName.length; i++) {
            targetName.push(randomName.charAt(i).toUpperCase());
        }

        return targetName;
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

    private checkIfGuessIsCorrect(): boolean {
        const currentGuess = this.guesses
            .find(g => g.guessNumber === this.guessNumber);

        if (currentGuess?.isCorrect) {
            return true;
        }

        if (currentGuess?.lettersNotFilled! === 0) {
            this.guessNumber++;
        }

        return false;
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
