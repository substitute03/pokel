import { Component, OnInit, Query } from '@angular/core';
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

    constructor() { }

    ngOnInit(): void {
        this.resetGame();
    }

    public onKeyDown(event: KeyboardEvent, currentInputElement: HTMLInputElement): void {
        const enteredCharacter = event.key;

        let guessToUpdate = this.guesses
            .find(g => g.guessNumber === this.guessNumber);

        // If the character is valid, add the Letter to the Guess.
        if (this.isValidCharacter(enteredCharacter)) {
            guessToUpdate?.addLetter(enteredCharacter);
            this.setFocusToNextElement(event, currentInputElement);

            if (this.isGuessCorrect() === true) {
                this.hasFoundWord = true;
            }
        }
        else if (enteredCharacter === "Backspace") {
            // else if backspace was pressed, remove the last Letter.
            guessToUpdate?.removeLastLetter();
            this.setFocusToPreviousElement(event, currentInputElement);
        }
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
    }

    private isGuessCorrect(): boolean {
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

    private setFocusToPreviousElement(event: KeyboardEvent, currentInputElement: HTMLInputElement): void {
        // Prevent default browser button press behaviour just in case.
        event.preventDefault();

        // Get the current input element's ID.
        const currentElementId = currentInputElement.id;

        // Extract the index from the ID.
        const currentIndex =
            parseInt(currentElementId.slice(1));

        // If there's a previous input element, set focus to it.
        if (currentIndex > 0) {
            const previousElementId = 'l' + (currentIndex - 1);

            const previousInputElement = document
                .getElementById(previousElementId) as HTMLInputElement;

            if (previousInputElement) {
                previousInputElement.focus();
            }
        }
    }

    private setFocusToNextElement(event: KeyboardEvent, currentInputElement: HTMLInputElement): void {
        // Prevent default browser button press behaviour just in case.
        event.preventDefault();

        // Get the current input element's ID.
        const currentElementId = currentInputElement.id;

        // Extract the index from the ID.
        const currentIndex =
            parseInt(currentElementId.slice(1));

        // If there's a next input element, set focus to it.
        if (currentIndex > 0) {
            const nextElementId = 'l' + (currentIndex + 1);

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
