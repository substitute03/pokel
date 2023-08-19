import { Component, OnInit } from '@angular/core';
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

    constructor() { }

    ngOnInit(): void {
        this.resetGame();
    }

    public onKey(event: any): void {
        const enteredCharacter = event.target.value;

        // Check the entered character is a letter.
        if (/^[A-Za-z]$/.test(enteredCharacter)) {
            this.guesses
                .find(g => g.guessNumber == this.guessNumber)
                ?.addLetter(event.target.value);

            this.guessNumber++;
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

    private hasFoundWord(): boolean {
        for (const guess of this.guesses) {
            if (guess.isCorrect) {
                return true;
            }
        }

        return false;
    }


    private isRealPokemon(): boolean {


        return false;
    }
}
