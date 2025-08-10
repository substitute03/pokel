import { Component, ElementRef, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { Guess } from '../domain/guess';
import { Game } from '../domain/game';
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'pok-game-screen',
    templateUrl: './game-screen.component.html',
    styleUrls: ['./game-screen.component.css',]
})
export class GameScreenComponent implements OnInit {

    private game: Game = new Game();

    // Expose game observables and properties for template binding
    get targetName$() { return this.game.targetName$; }
    get guesses$() { return this.game.guesses$; }
    get pokemon() { return this.game.pokemon; }
    get generations() { return this.game.generations; }
    get targetNameString() { return this.game.targetNameString; }
    get guessNumber() { return this.game.guessNumber; }
    get hasFoundWord() { return this.game.hasFoundWord; }
    get gameOver() { return this.game.gameOver; }
    get focussedLetterIndex() { return this.game.focussedLetterIndex; }
    get focussedGuessIndex() { return this.game.focussedGuessIndex; }
    get evaluatingGuess() { return this.game.evaluatingGuess; }

    @ViewChild('letterBoxesRef', { read: ElementRef }) letterBoxesRef!: ElementRef;
    @ViewChild('helpModal') helpModal!: any;

    constructor(private changeDetectorRef: ChangeDetectorRef, private modalService: NgbModal) { }

    ngOnInit(): void {
        this.game.initializeGame();
        this.focusLetterBox(this.game.focussedGuessIndex!, this.game.focussedLetterIndex!);
    }

    @HostListener('window:keydown', ['$event'])
    onWindowKeyDown(event: KeyboardEvent) {
        event.preventDefault(); // Prevent default browser behavior to avoid the space bar being able to click the "Play again" button.

        if (!this.game.canProcessInput()) {
            return;
        }

        const pressedKey = event.key;

        if (pressedKey === "ArrowLeft") {
            this.handleLeftArrowPressed();
        }
        else if (pressedKey === "ArrowRight" || pressedKey === "Tab") {
            this.handleRightArrowPressed(event);
        }
        else if (pressedKey === "Backspace") {
            this.handleBackspacePressed();
        }
        else if (pressedKey === "Delete") {
            this.handleDeletePressed();
        }
        else if (pressedKey === "Enter") {
            this.handleEnterPressed(event);
        }
        else if (this.game.isValidCharacter(pressedKey)) {
            this.handleValidCharacterPressed(pressedKey);
        }
    }

    private handleLeftArrowPressed(): void {
        const result = this.game.handleLeftArrow();
        if (result) {
            this.game.focussedGuessIndex = result.newGuessIndex;
            this.game.focussedLetterIndex = result.newLetterIndex;
            this.focusLetterBox(result.newGuessIndex, result.newLetterIndex);
        }
    }

    private handleRightArrowPressed(event: KeyboardEvent): void {
        event.preventDefault();
        const result = this.game.handleRightArrow();
        if (result) {
            this.game.focussedGuessIndex = result.newGuessIndex;
            this.game.focussedLetterIndex = result.newLetterIndex;

            if (result.navigatedPastFinalBox) {
                this.blurAllLetterBoxes();
            } else {
                this.focusLetterBox(result.newGuessIndex, result.newLetterIndex);
            }
        }
    }

    private handleBackspacePressed(): void {
        const result = this.game.handleBackspace();
        if (result) {
            this.game.focussedGuessIndex = result.newGuessIndex;
            this.game.focussedLetterIndex = result.newLetterIndex;

            if (result.shouldUpdateGuesses) {
                this.game.guesses$.next([...this.game.guesses$.value]);
            }

            this.focusLetterBox(result.newGuessIndex, result.newLetterIndex);
        }
    }

    private handleDeletePressed(): void {
        const result = this.game.handleDelete();
        if (result && result.shouldUpdateGuesses) {
            this.game.guesses$.next([...this.game.guesses$.value]);
        }
    }

    private handleEnterPressed(event: KeyboardEvent): void {
        const letterBoxes = this.letterBoxesRef.nativeElement
            .querySelectorAll('[current-guess]');

        letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
            letterBox.classList.remove('shiver');
        });

        event.preventDefault();
        const result = this.game.handleEnter();

        if (result.isValidPokemon && result.currentGuess) {
            // Make sure the focussed letter index is not -1 as this interferes with
            // the pokeball spinner and pushes the boxes to the right
            this.game.focussedLetterIndex = 1;

            // Valid Pokemon - apply flip animation
            letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
                letterBox.classList.remove('border-dark');
                letterBox.classList.remove('border-4');
                letterBox.classList.add('border-secondary');
            });

            if (result.isValidGuess) {
                this.game.guesses$.next([...this.game.guesses$.value]);
            }

            letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
                setTimeout(() => {
                    this.game.evaluatingGuess = true;
                    letterBox.classList.add('flip');
                    if (index === letterBoxes.length - 1) {
                        setTimeout(() => {
                            this.handleGuessResult(result.currentGuess!);
                        }, 1000);
                    }
                }, index * 100);
            });
        } else {
            // Invalid Pokemon - apply shiver effect
            letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
                setTimeout(() => {
                    letterBox.classList.add('shiver');
                }, index * 50);
            });
        }
    }

    private handleValidCharacterPressed(pressedKey: string): void {
        const result = this.game.handleValidCharacter(pressedKey);

        if (result.success) {
            this.game.focussedGuessIndex = result.newGuessIndex;
            this.game.focussedLetterIndex = result.newLetterIndex;

            if (result.shouldUpdateGuesses) {
                this.game.guesses$.next([...this.game.guesses$.value]);
            }

            if (result.isLastLetter) {
                this.blurAllLetterBoxes();
            } else {
                this.focusLetterBox(result.newGuessIndex, result.newLetterIndex);
            }
        }
    }

    private handleGuessResult(currentGuess: Guess): void {
        const result = this.game.handleGuessResult(currentGuess);

        switch (result.gameState) {
            case 'correct':
                this.blurAllLetterBoxes();
                this.changeDetectorRef.detectChanges();
                break;
            case 'final':
                // Update guesses to reflect the final evaluation
                this.game.guesses$.next([...this.game.guesses$.value]);
                this.changeDetectorRef.detectChanges();
                break;
            case 'continue':
                if (result.shouldUpdateFocus) {
                    this.focusLetterBox(result.newGuessIndex, result.newLetterIndex);
                }
                this.changeDetectorRef.detectChanges();
                break;
        }
    }

    public focusLetterBox(guessIndex: number, letterIndex: number): void {
        this.changeDetectorRef.detectChanges();
        const letterBoxElement = this.getLetterBoxElement(guessIndex, letterIndex);

        if (letterBoxElement) {
            // Remove focus from all letter boxes
            this.blurAllLetterBoxes();

            // Set focus and highlight on the clicked letter box
            letterBoxElement.focus();
            this.game.focussedLetterIndex = letterIndex;
            letterBoxElement.classList.remove('border-secondary')
            letterBoxElement.classList.add('border-4');
            letterBoxElement.classList.add('border-dark');
        }
    }

    private blurAllLetterBoxes(): void {
        const letterBoxes = this.letterBoxesRef.nativeElement.querySelectorAll('.letter-box');
        letterBoxes.forEach((letterBox: HTMLElement) => {
            letterBox.blur();
            letterBox.classList.remove('border-dark')
            letterBox.classList.remove('border-4');
            letterBox.classList.add('border-secondary');
        });
    }

    private getLetterBoxElement(guessIndex: number, letterIndex: number): HTMLElement | null {
        const letterBoxId = `g${guessIndex}l${letterIndex}`;
        return this.letterBoxesRef.nativeElement.querySelector(`#${letterBoxId}`);
    }

    public toggleGeneration(event: Event, generationNumber: number, dropdown?: NgbDropdown): void {
        event.preventDefault();
        event.stopPropagation();

        const success = this.game.toggleGeneration(generationNumber);

        if (success) {
            // Keep dropdown open
            if (dropdown) {
                setTimeout(() => {
                    dropdown.open();
                }, 0);
            }

            // Reset focus after game reset
            this.focusLetterBox(this.game.focussedGuessIndex!, this.game.focussedLetterIndex!);
        }
    }

    public getSelectedGenerationsText(): string {
        return this.game.getSelectedGenerationsText();
    }

    public resetToGen1(event: Event, dropdown?: NgbDropdown): void {
        event.preventDefault();
        this.game.resetToGen1();

        // Close dropdown after reset
        if (dropdown) {
            dropdown.close();
        }

        // Reset focus after game reset
        this.focusLetterBox(this.game.focussedGuessIndex!, this.game.focussedLetterIndex!);
    }

    public resetGame(): void {
        this.game.resetGame();
        this.focusLetterBox(this.game.focussedGuessIndex!, this.game.focussedLetterIndex!);
    }

    public openHelpModal(): void {
        this.modalService.open(this.helpModal, { size: 'lg' });
    }
}
