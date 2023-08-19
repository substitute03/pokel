export class Letter {
    public value: string = "";
    public readonly guessOutcome: MatchType = 'none'

    /**
     *
     */
    constructor(letter: string) {
        this.setValue(letter);
    }

    public setValue(value: string): void {
        if (this.isValid(value)) {
            this.value = value;
        }
    }

    private isValid(value: string): boolean {
        return /^[A-Za-z]$/.test(this.value) && value.length === 1;
    }
}

export type MatchType = 'exact' | 'fuzzy' | 'none'