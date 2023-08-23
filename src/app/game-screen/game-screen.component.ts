import { Component, ElementRef, OnInit, Query, ViewChild, Renderer2, HostListener, ChangeDetectorRef } from '@angular/core';
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
    targetNameString: string = "";
    guesses: Guess[] = [];
    guessNumber: number = 1;
    hasFoundWord: boolean = false;
    focussedLetterIndex: number | null = null;
    focussedGuessIndex: number | null = null;
    showTargetName: boolean = false;

    @ViewChild('letterBoxesRef', { read: ElementRef }) letterBoxesRef!: ElementRef;

    constructor(private changeDetectorRef: ChangeDetectorRef) { }

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

        // Handle left arrow
        if (pressedKey === "ArrowLeft") {
            if (this.focussedLetterIndex === -1) {
                this.focussedLetterIndex = this.targetNameString.length - 1;
            } else if (this.focussedLetterIndex === 0) {
                this.focussedLetterIndex = 0;
            } else {
                this.focussedLetterIndex -= 1;
            }

            this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex);
        }
        // Handle right arrow
        if (pressedKey === "ArrowRight" || pressedKey === "Tab") {
            event.preventDefault();
            if (this.focussedLetterIndex === -1) {
                this.focussedLetterIndex = -1;
            } else if (this.focussedLetterIndex === this.targetNameString.length - 1) {
                this.focussedLetterIndex = -1;
                this.blurAllLetterBoxes();
            } else {
                this.focussedLetterIndex += 1;
            }

            this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex);
        }

        // Handle backspace
        if (pressedKey === "Backspace") {
            if (this.focussedLetterIndex == -1) {
                guessToUpdate?.letters[this.targetName$.value.length - 1]
                    .deleteValue();
                this.focusLetterBox(this.focussedGuessIndex, this.targetName$.value.length - 1)
            }
            else {
                guessToUpdate?.letters[this.focussedLetterIndex - 1]
                    .deleteValue();

                this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex - 1);
            }
        }

        if (pressedKey === "Delete") {
            guessToUpdate?.letters[this.focussedLetterIndex].deleteValue();
        }

        // Handle enter
        else if (pressedKey === "Enter") {
            const currentGuess: Guess = this.getCurrentGuess();
            console.log(currentGuess.getValue().toUpperCase());

            if (currentGuess.lettersNotFilled === 0 && currentGuess.isCorrect) {
                this.blurAllLetterBoxes(); // Make sure border styles are removed so that the succes borders apply correctly to the all current guess boxed.
                this.hasFoundWord = true;
            }
            else if (this.pokemon.includes(currentGuess.getValue().toUpperCase())) {
                currentGuess.isCorrect; // This will evaluate the guess and set the letter match types.

                if (this.guessNumber === 6) {
                    this.showTargetName = true;
                    return;
                }

                this.guessNumber++;
                this.focussedGuessIndex++;
                this.focussedLetterIndex = 0;

                // Focus the first letter box of the next guess row.
                this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex);
            }

        }

        // Handle valid key press
        else if (this.isValidCharacter(pressedKey)) {
            guessToUpdate?.letters[this.focussedLetterIndex]
                .setValue(pressedKey);

            // if at the last index, set focuessedindex to -1 so the extra icon appears after the guess letterbox.
            const isLastLetter: boolean =
                this.focussedLetterIndex === this.targetName$.value.length! - 1;

            if (isLastLetter) {
                this.focussedLetterIndex = -1;
                this.blurAllLetterBoxes();
            }
            else {
                this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex + 1)
            }

        };
    }

    public focusLetterBox(guessIndex: number, letterIndex: number): void {
        this.changeDetectorRef.detectChanges();
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
        this.guesses = [];
        for (let i = 1; i <= 6; i++) {
            this.guesses.push(new Guess(this.targetName$.value, i))
        }
    }

    public resetGame(): void {
        this.targetName$.next(this.getTargetName());
        this.targetNameString = this.targetName$.value.filter(l => l !== "").map(l => l).join("");
        this.setInitialGuesses();
        this.guessNumber = 1;
        this.hasFoundWord = false;
        this.focussedGuessIndex = 0;
        this.focussedLetterIndex = 0;
        this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex);
    }

    private isValidCharacter(char: string): boolean {
        if (/^[A-Za-z]$/.test(char)) {
            return true;
        }

        return false;
    }




    private isRealPokemon(): boolean {


        return false;
    }
}
