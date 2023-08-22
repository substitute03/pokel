import { Letter } from "./letter";
import { MatchType } from "./letter";

export class Guess {
    public readonly letters: Letter[] = [];
    public guessNumber: number = 0;
    public get isCorrect(): boolean {
        return this.isGuessCorrect();
    }
    private targetName: string = "";

    public getValue(): string {
        return this.letters.filter(l => l.value !== "").map(l => l.value).join("");
    }

    public get lettersFilled(): number {
        return this.letters
            .filter(l => l.value !== "").length;
    }

    public get lettersNotFilled(): number {
        return this.letters
            .filter(l => l.value === "").length;
    }

    constructor(targetName: string[], guessNumber: number) {
        this.letters = targetName.map(() => new Letter(""));
        this.targetName = targetName.map(char => char).join("");;
        this.guessNumber = guessNumber;
    }

    public addLetter(letter: string, indexToAdd?: number): void {
        if (indexToAdd) { // Add at index.
            this.letters[indexToAdd].setValue(letter);
        }
        else if (!indexToAdd) { // Add at first empty letter.
            if (this.lettersFilled !== this.targetName.length) {
                let letterToUpdate: Letter | undefined = this.letters.find(l => l.value === "");
                letterToUpdate?.setValue(letter);
                this.updateFocus(); // Used to apply CSS to the currently focuessed letter.
            }
        }
        else {
            throw new Error(`Cannot add a letter beyond the target name's length (${this.targetName.length})`)
        }
    }

    public removeLastLetter(): void {
        const letterToRemove: Letter = this.getlastLetter();
        letterToRemove.deleteValue();
        this.updateFocus(); // Used to apply CSS to the currently focuessed letter.
    }

    public getlastLetter(): Letter {
        const lastAddedLetterIndex: number = this.letters
            .map(l => l.value !== "").lastIndexOf(true);

        if (lastAddedLetterIndex === -1) {
            return this.letters[lastAddedLetterIndex];
        }

        return this.letters[lastAddedLetterIndex];
    }

    private updateFocus(): void {
        this.getlastLetter().isFocus = true;

        this.letters.filter(l => l.value === "").forEach(l => {
            l.isFocus = false;
        });
    }

    private isGuessCorrect(): boolean {
        this.evaluate();

        if (this.letters.filter(l => l.matchType === "exact").length === this.targetName.length) {
            return true;
        }

        return false;
    }

    private evaluate(): void {
        for (let i = 0; i < this.targetName.length; i++) {
            let letter: string = this.letters[i].value.toUpperCase();
            let targetLetter: string = this.targetName.substring(i, i + 1).toUpperCase();

            if (letter === "") {
                this.letters[i].matchType = 'none';
            }
            else if (letter === targetLetter) {
                this.letters[i].matchType = 'exact';
            }
            else if (this.targetName.toUpperCase().includes(letter)) {
                this.letters[i].matchType = 'fuzzy';
            }
            else {
                this.letters[i].matchType = 'none'
            }
        }
    }
}