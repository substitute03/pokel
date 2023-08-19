import { Letter } from "./letter";

export class Guess {
    public readonly letters: Letter[] = [];
    public guessNumber: number = 0;
    public get isCorrect(): boolean {
        return this.isGuessCorrect();
    }
    private targetName: string = "";

    public getValue(): string {
        return this.letters.map(l => l.value).toString();
    }

    public lettersFilled: number = this.letters
        .filter(l => l.value !== "").length;

    public lettersNotFilled: number = this.letters
        .filter(l => l.value === "").length;

    constructor(targetName: string[], guessNumber: number) {
        this.letters = Array(targetName.length).fill(new Letter(""));
        this.targetName = targetName.toString();
        this.guessNumber = guessNumber;
    }

    public addLetter(letter: string): void {
        if (this.lettersFilled !== this.targetName.length) {
            this.letters.find(l => l.value === "")?.setValue(letter);
        }
        else {
            throw new Error(`Cannot add a letter beyond the target name's length (${this.targetName.length})`)
        }
    }

    private isGuessCorrect(): boolean {
        if (this.getValue().toUpperCase() == this.targetName.toUpperCase()) {
            return true;
        }

        return false;
    }
}