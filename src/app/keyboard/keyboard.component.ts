import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Guess } from '../domain/guess';

interface letterClass {
    letter: string;
    classes: classes;
}

interface classes {
    'border-4': boolean;
    'border-1': boolean;
    'border-secondary': boolean;
    'border-warning': boolean;
    'border-success': boolean;
}

const alphabet: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

@Component({
    selector: 'keyboard',
    templateUrl: './keyboard.component.html',
    styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnChanges {
    @Input() guesses: Guess[] = [];
    @Input() evaluatingGuess: boolean = false;
    @Input() isDoingFlipAnimation: boolean = false;
    @Output() validKeyPress: EventEmitter<string> = new EventEmitter<string>();
    currentLetterClasses: letterClass[] = [];

    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['guesses'] && !changes['guesses'].firstChange) {
            this.onGuessesChanged();
        }
    }

    private onGuessesChanged(): void {
        // Only update keyboard colors after evaluation AND flip animations are complete
        if (!this.evaluatingGuess && !this.isDoingFlipAnimation) {
            // Clear the current letter classes before recalculating
            this.currentLetterClasses = [];

            alphabet.forEach(letter => {
                this.getKeyBorderClass(letter);
            });
        }
    }

    public keyOnClick(key: string): void {
        this.validKeyPress.emit(key);
    }

    public getKeyBorderClass(letter: string): { [key: string]: boolean } {
        if (!this.evaluatingGuess && !this.isDoingFlipAnimation) {
            // Find the best match type for this letter across all guesses
            let bestMatchType: string = 'unknown';

            for (const guess of this.guesses) {
                // Check ALL letters in this guess that match the current letter
                const matchingLetters = guess.letters.filter(
                    guessLetter => guessLetter.value.toUpperCase() === letter
                );

                for (const matchingLetter of matchingLetters) {
                    if (matchingLetter.matchType === 'exact') {
                        bestMatchType = 'exact';
                        break; // 'exact' is the highest priority so we can break out of both loops
                    } else if (matchingLetter.matchType === 'fuzzy' && bestMatchType !== 'exact') {
                        bestMatchType = 'fuzzy';
                    } else if (matchingLetter.matchType === 'none' && bestMatchType === 'unknown') {
                        bestMatchType = 'none';
                    }
                }

                // If we found an exact match, we can break out of the outer loop too
                if (bestMatchType === 'exact') {
                    break;
                }
            }

            const currentLetterClass = this.currentLetterClasses.find(l => l.letter === letter);

            if (currentLetterClass) {
                // Remove the current letter class from the array
                this.currentLetterClasses.splice(this.currentLetterClasses.indexOf(currentLetterClass), 1);
            }

            // Add the new letter class to the array
            this.currentLetterClasses.push({
                letter: letter,
                classes: {
                    'border-4': bestMatchType !== 'unknown',
                    'border-1': bestMatchType === 'unknown',
                    'border-secondary': bestMatchType === 'none' || bestMatchType === 'unknown',
                    'border-warning': bestMatchType === 'fuzzy',
                    'border-success': bestMatchType === 'exact'
                },
            });

            return {
                'border-4': bestMatchType !== 'unknown',
                'border-1': bestMatchType === 'unknown',
                'border-secondary': bestMatchType === 'none' || bestMatchType === 'unknown',
                'border-warning': bestMatchType === 'fuzzy',
                'border-success': bestMatchType === 'exact'
            };
        }
        else {
            // During evaluation, maintain the current colors
            const currentLetterClass = this.currentLetterClasses.find(l => l.letter === letter);
            if (this.currentLetterClasses.length === 0 || !currentLetterClass) {
                // If no classes are set yet, use default styling (no colored borders)
                return {
                    'border-4': false,
                    'border-1': true,
                    'border-secondary': true,
                    'border-warning': false,
                    'border-success': false
                }
            } else {
                // Return the current border class for the letter to maintain colors during evaluation
                const currentLetterClass = this.currentLetterClasses.find(l => l.letter === letter);
                if (currentLetterClass) {
                    return {
                        'border-4': currentLetterClass.classes['border-4'],
                        'border-1': currentLetterClass.classes['border-1'],
                        'border-secondary': currentLetterClass.classes['border-secondary'],
                        'border-warning': currentLetterClass.classes['border-warning'],
                        'border-success': currentLetterClass.classes['border-success']
                    };
                } else {
                    return {
                        'border-4': false,
                        'border-secondary': true,
                        'border-warning': false,
                        'border-success': false
                    };
                }
            }
        }
    }
}
