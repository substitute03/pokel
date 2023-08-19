import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

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

    // targetName$: Observable<string[]> | undefined;
    targetName$ = new BehaviorSubject<string[]>([]);
    guess1: string[] = [];
    guess2: string[] = [];
    guess3: string[] = [];
    guess4: string[] = [];
    guess5: string[] = [];
    guess6: string[] = [];
    guessNumber: number = 1;
    letterNunber = 1;

    constructor() { }

    ngOnInit(): void {
        this.resetGame();
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
        for (let i = 0; i < this.targetName$?.value.length; i++) {
            this.guess1.push("");
            this.guess2.push("");
            this.guess3.push("");
            this.guess4.push("");
            this.guess5.push("");
            this.guess6.push("");
        }

        this.guessNumber = 1;
    }

    private resetGame(): void {
        this.targetName$.next(this.getTargetName());
        this.setInitialGuesses();
    }

    public onKey(event: any): void {
        switch (this.guessNumber) {
            case 1: {
                this.guess1.push(event.target.value);
                break;
            }
            case 2: {
                this.guess2.push(event.target.value);
                break;
            }
            case 3: {
                this.guess3.push(event.target.value)
                break;
            }
            case 4: {
                this.guess4.push(event.target.value)
                break;
            }
            case 5: {
                this.guess5.push(event.target.value)
                break;
            }
            case 6: {
                this.guess6.push(event.target.value)
                break;
            }
        }
    }

    private hasFoundWord(): boolean {
        const allLettersHaveBeenEntered: boolean =
            this.targetName$.value.length === this.guess1.length;

        if (allLettersHaveBeenEntered) {
            return this.targetName$.value.toString().toUpperCase() ===
                this.guess1.toString().toUpperCase();
        }


        return false;
    }
}
