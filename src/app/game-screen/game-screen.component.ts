import { Component, ElementRef, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { Guess } from '../domain/guess';
import { Game } from '../domain/game';
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LetterboxesComponent } from '../letterboxes/letterboxes.component';

@Component({
    selector: 'pok-game-screen',
    templateUrl: './game-screen.component.html',
    styleUrls: ['./game-screen.component.css',]
})
export class GameScreenComponent implements OnInit {

    public game: Game = new Game();

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

    // Track flip animation state
    isDoingFlipAnimation: boolean = false;


    @ViewChild('helpModal') helpModal!: any;
    @ViewChild('letterboxesComponent') letterboxesComponent!: LetterboxesComponent;

    constructor(private changeDetectorRef: ChangeDetectorRef, private modalService: NgbModal) { }

    ngOnInit(): void {
        this.game.initializeGame();
        this.focusLetterBox(this.game.focussedGuessIndex!, this.game.focussedLetterIndex!);
    }

    onVirtualKeyboardKeyPress(key: string): void {
        if (key === "Enter") {
            this.handleEnterPressed(new KeyboardEvent("keydown", { key: "Enter" }));
        }
        else if (key === "Backspace") {
            this.handleBackspacePressed();
        }
        else if (this.game.isValidCharacter(key)) {
            this.handleValidCharacterPressed(key);
        }
    }

    @HostListener('window:keydown', ['$event'])
    onWindowKeyDown(event: KeyboardEvent) {
        const pressedKey = event.key;

        if (pressedKey === " ") {
            event.preventDefault(); // Prevent default browser behavior to avoid the space bar being able to click the "Play again" button.
        }

        if (!this.game.canProcessInput()) {
            return;
        }

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
        event.preventDefault();
        const result = this.game.handleEnter();

        if (result.isValidPokemon && result.currentGuess) {
            // Make sure the focussed letter index is not -1 as this interferes with
            // the pokeball spinner and pushes the boxes to the right
            this.game.focussedLetterIndex = 1;

            if (result.isValidGuess) {
                this.game.guesses$.next([...this.game.guesses$.value]);
            }

            // Apply flip animation for valid Pokemon
            if (this.letterboxesComponent) {
                // Set evaluating state to show pokeball spinner
                this.game.evaluatingGuess = true;
                this.isDoingFlipAnimation = true;

                this.letterboxesComponent.applyFlipAnimation();

                // Calculate proper delay based on number of letters
                // Each letter has 150ms delay, plus 1000ms for the flip animation itself
                const letterCount = result.currentGuess.letters.length;
                const totalDelay = (letterCount * 150) + 1000;

                // Wait for animation to complete before processing result
                setTimeout(() => {
                    this.handleGuessResult(result.currentGuess!);
                    this.isDoingFlipAnimation = false;
                }, totalDelay);

                // Keep pokeball visible for a bit longer for better UX
                setTimeout(() => {
                    this.game.evaluatingGuess = false;
                }, totalDelay + 500);
            }
        } else {
            // Apply shiver animation for invalid Pokemon
            if (this.letterboxesComponent) {
                this.letterboxesComponent.applyShiverAnimation();
            }
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

    public onFocusLetterBox(event: { guessIndex: number, letterIndex: number }): void {
        this.game.focussedLetterIndex = event.letterIndex;
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

        if (this.letterboxesComponent) {
            this.letterboxesComponent.focusLetterBoxElement(guessIndex, letterIndex);
            this.game.focussedLetterIndex = letterIndex;
        }
    }

    private blurAllLetterBoxes(): void {
        if (this.letterboxesComponent) {
            this.letterboxesComponent.blurAllLetterBoxes();
        }
    }

    private getLetterBoxElement(guessIndex: number, letterIndex: number): HTMLElement | null {
        if (this.letterboxesComponent) {
            return this.letterboxesComponent.getLetterBoxElement(guessIndex, letterIndex);
        }
        return null;
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
