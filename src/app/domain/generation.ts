export class generation {
    generationNumber: number = 0;

    pokemonNames: string[] = [];

    constructor(generationNumber: number, pokemonNames: string[]) {
        this.generationNumber = generationNumber;
        this.pokemonNames = pokemonNames;
    }
}