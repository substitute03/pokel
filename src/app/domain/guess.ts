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
        this.targetName = targetName.toString();
        this.guessNumber = guessNumber;

        // If this is the first guess, then set the focus of the first letter
        // to true so that the correct CSS is applied.
        if (guessNumber === 1) {
            this.letters[0].isFocus = true;
        }
    }

    public addLetter(letter: string): void {
        if (this.lettersFilled !== this.targetName.length) {
            let letterToUpdate: Letter | undefined = this.letters.find(l => l.value === "");
            letterToUpdate?.setValue(letter);
            this.updateFocus(); // Used to apply CSS to the currently focuessed letter.
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
        if (this.getValue().toUpperCase() == this.targetName.toUpperCase()) {
            return true;
        }

        return false;
    }

    private setLetterMatchTypes(): void {

    }
}