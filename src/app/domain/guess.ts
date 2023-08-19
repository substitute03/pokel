export class Guess {
    public guess: string[] = [];
    public guessNumber: number = 0;
    public lettersFilled: number = this.guess
        .filter(g => g !== "").length;
    public lettersNotFilled: number = this.guess
        .filter(g => g === "").length;

    constructor(guessNumber: number) {
        this.guessNumber = guessNumber;
    }
}