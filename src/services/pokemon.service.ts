import { Injectable } from "@angular/core";
import { FlavorText, Pokemon, PokemonClient, PokemonSpecies } from "pokenode-ts";

@Injectable({
    providedIn: 'root'
})
export class PokemonService {
    // uses the pokenode-ts library to get the pokemon data by name
    private readonly pokemonClient = new PokemonClient();

    constructor() {
        this.pokemonClient = new PokemonClient();
    }

    async getPokemonSpriteByName(name: string, size: "large" | "small" = "large"): Promise<string | null> {
        const pokemon: Pokemon = await this.pokemonClient
            .getPokemonByName(name);

        if (size === "large") {
            return pokemon?.sprites?.other?.['official-artwork']?.front_default ?? null;
        }
        else {
            return pokemon?.sprites?.front_default ?? null;
        }
    }

    async getPokedexEntryByName(name: string): Promise<string | null> {
        // Get the latest pokedex entry for the pokemon
        const pokemonSpecies: PokemonSpecies = await this.pokemonClient
            .getPokemonSpeciesByName(name);

        const pokedexEntry: FlavorText | undefined = pokemonSpecies.flavor_text_entries
            .find(entry => entry.language.name === "en");

        // format this string to remove all odd characters and make it a single line
        const formattedEntry = pokedexEntry?.flavor_text
            .replace("", " ")
            .replace(/\n/g, " ")
            .replace(/\r/g, " ")
            .replace(/\t/g, " ")
            .replace(/\s+/g, " ");

        return formattedEntry ?? null;
    }
}