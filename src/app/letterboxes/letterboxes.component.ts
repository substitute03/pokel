import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Guess } from '../domain/guess';

@Component({
    selector: 'letterboxes',
    templateUrl: './letterboxes.component.html',
    styleUrls: ['./letterboxes.component.css']
})
export class LetterboxesComponent {
    @Input() guesses: Guess[] = [];
    @Input() guessNumber: number = 1;
    @Input() gameOver: boolean = false;
    @Input() hasFoundWord: boolean = false;
    @Input() focussedLetterIndex: number | null = -1;
    @Input() evaluatingGuess: boolean = false;

    @Output() focusLetterBox = new EventEmitter<{ guessIndex: number, letterIndex: number }>();

    @ViewChild('letterBoxesRef', { read: ElementRef }) letterBoxesRef!: ElementRef;

    constructor(private changeDetectorRef: ChangeDetectorRef) { }

    getLetterBoxElement(guessIndex: number, letterIndex: number): HTMLElement | null {
        const letterBoxId = `g${guessIndex}l${letterIndex}`;
        return this.letterBoxesRef.nativeElement.querySelector(`#${letterBoxId}`);
    }

    blurAllLetterBoxes(): void {
        const letterBoxes = this.letterBoxesRef.nativeElement.querySelectorAll('.letter-box');
        letterBoxes.forEach((letterBox: HTMLElement) => {
            letterBox.blur();
            letterBox.classList.remove('border-dark')
            letterBox.classList.remove('border-4');
            letterBox.classList.add('border-secondary');
        });
    }

    focusLetterBoxElement(guessIndex: number, letterIndex: number): void {
        this.changeDetectorRef.detectChanges();
        const letterBoxElement = this.getLetterBoxElement(guessIndex, letterIndex);

        if (letterBoxElement) {
            // Remove focus from all letter boxes
            this.blurAllLetterBoxes();

            // Set focus and highlight on the clicked letter box
            letterBoxElement.focus();
            letterBoxElement.classList.remove('border-secondary')
            letterBoxElement.classList.add('border-4');
            letterBoxElement.classList.add('border-dark');
        }
    }

    applyFlipAnimation(): void {
        const letterBoxes = this.letterBoxesRef.nativeElement.querySelectorAll('[current-guess]');

        this.clearAnimations();

        this.blurAllLetterBoxes();

        letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
            setTimeout(() => {
                letterBox.classList.add('flip');
            }, index * 150);
        });
    }

    applyShiverAnimation(): void {
        const letterBoxes = this.letterBoxesRef.nativeElement.querySelectorAll('[current-guess]');

        this.clearAnimations();

        letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
            setTimeout(() => {
                letterBox.classList.add('shiver');
            }, index * 50);
        });
    }

    clearAnimations(): void {
        const letterBoxes = this.letterBoxesRef.nativeElement.querySelectorAll('[current-guess]');

        letterBoxes.forEach((letterBox: HTMLElement) => {
            letterBox.classList.remove('flip', 'shiver');
        });
    }

    letterBoxOnClick(guessIndex: number, letterIndex: number): void {
        this.focusLetterBoxElement(guessIndex, letterIndex);

        // Emit event to update the game's focused letter index
        this.focusLetterBox.emit({ guessIndex, letterIndex });
    }
}
