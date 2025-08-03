import { Component, ElementRef, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Guess } from '../domain/guess';
import { generationService } from '../services/generationService'
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'pok-game-screen',
    templateUrl: './game-screen.component.html',
    styleUrls: ['./game-screen.component.css',]
})
export class GameScreenComponent implements OnInit {

    pokemon: string[] = [];
    generations: number[] = [1];
    targetName$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    targetNameString: string = "";
    guesses$: BehaviorSubject<Guess[]> = new BehaviorSubject<Guess[]>([]);
    guessNumber: number = 1;
    hasFoundWord: boolean = false;
    gameOver: boolean = false;
    focussedLetterIndex: number | null = null;
    focussedGuessIndex: number | null = null;
    generationService = new generationService();
    evaluatingGuess: boolean = false;

    @ViewChild('letterBoxesRef', { read: ElementRef }) letterBoxesRef!: ElementRef;

    constructor(private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.pokemon = this.generationService.getPokemonByGeneration(this.generations)
        this.resetGame();
    }

    @HostListener('window:keydown', ['$event'])
    onWindowKeyDown(event: KeyboardEvent) {
        if (this.focussedGuessIndex === null || this.focussedLetterIndex === null || this.hasFoundWord || this.evaluatingGuess) {
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
        else if (this.isValidCharacter(pressedKey)) {
            this.handleValidCharacterPressed(pressedKey);
        }
    }

    private handleLeftArrowPressed(): void {
        if (this.focussedLetterIndex === -1) {
            this.focussedLetterIndex = this.targetNameString.length - 1;
        } else if (this.focussedLetterIndex === 0) {
            this.focussedLetterIndex = 0;
        } else {
            this.focussedLetterIndex! -= 1;
        }

        this.focusLetterBox(this.focussedGuessIndex!, this.focussedLetterIndex!);
    }

    private handleRightArrowPressed(event: KeyboardEvent): void {
        event.preventDefault();
        if (this.focussedLetterIndex === -1) {
            this.focussedLetterIndex = -1;
        } else if (this.focussedLetterIndex === this.targetNameString.length - 1) {
            this.focussedLetterIndex = -1;
            this.blurAllLetterBoxes();
        } else {
            this.focussedLetterIndex! += 1;
        }

        this.focusLetterBox(this.focussedGuessIndex!, this.focussedLetterIndex!);
    }

    private handleBackspacePressed(): void {
        let guessToUpdate: Guess | undefined = this.guesses$.value
            .find(g => g.guessNumber === this.guessNumber);

        if (this.focussedLetterIndex == -1) {
            guessToUpdate?.letters[this.targetName$.value.length - 1]
                .deleteValue();
            this.focusLetterBox(this.focussedGuessIndex!, this.targetName$.value.length - 1)
        }
        else {
            guessToUpdate?.letters[this.focussedLetterIndex! - 1]
                .deleteValue();

            this.focusLetterBox(this.focussedGuessIndex!, this.focussedLetterIndex! - 1);
        }
        // Trigger change detection for BehaviorSubject
        this.guesses$.next([...this.guesses$.value]);
    }

    private handleDeletePressed(): void {
        let guessToUpdate: Guess | undefined = this.guesses$.value
            .find(g => g.guessNumber === this.guessNumber);

        guessToUpdate?.letters[this.focussedLetterIndex!].deleteValue();
        // Trigger change detection for BehaviorSubject
        this.guesses$.next([...this.guesses$.value]);
    }

    private handleEnterPressed(event: KeyboardEvent): void {
        const letterBoxes = this.letterBoxesRef.nativeElement
            .querySelectorAll('[current-guess]');

        letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
            letterBox.classList.remove('shiver');
        });

        event.preventDefault();
        const currentGuess: Guess = this.getCurrentGuess();

        if (this.pokemon.includes(currentGuess.getValue().toUpperCase())) {
            letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
                letterBox.classList.remove('border-dark');
                letterBox.classList.remove('border-4');
                letterBox.classList.add('border-secondary');
            });

            // Evaluate the guess to set matchTypes for all letters
            currentGuess.evaluateGuess();

            // Force evaluation and update the BehaviorSubject to trigger change detection
            this.guesses$.next([...this.guesses$.value]);

            letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
                setTimeout(() => {
                    this.evaluatingGuess = true; // This is to stop double presses of enter while the animation occurs (which will skip guesses). Set back to false below.
                    letterBox.classList.add('flip');
                    if (index === letterBoxes.length - 1) {
                        // Animation is complete. Move to the next guess
                        setTimeout(() => {
                            this.handleGuessResult(currentGuess);
                        }, 1000); // Adjust the delay as needed
                    }
                }, index * 100); // Adjust the delay as needed
            });
        }
        else {
            // Invalid Pokemon - apply shiver effect
            letterBoxes.forEach((letterBox: HTMLElement, index: number) => {
                setTimeout(() => {
                    letterBox.classList.add('shiver');
                }, index * 0.5); // Adjust the delay as needed
            });
        }
    }

    private handleValidCharacterPressed(pressedKey: string): void {
        let guessToUpdate: Guess | undefined = this.guesses$.value
            .find(g => g.guessNumber === this.guessNumber);

        // Check if the previous letter box is empty (except for the first box)
        if (this.focussedLetterIndex! > 0) {
            const previousLetter = guessToUpdate?.letters[this.focussedLetterIndex! - 1];

            // Don't allow typing if the previous box is empty and the there are already letters in the guess
            // This is to ensure that all guesses are continuous strings with no gaps
            if ((!previousLetter || !previousLetter.value || previousLetter.value.trim() === '') &&
                guessToUpdate?.lettersFilled !== undefined && guessToUpdate?.lettersFilled > 0) {
                return;
            }
        }

        guessToUpdate?.letters[this.focussedLetterIndex!]
            .setValue(pressedKey);

        // Trigger change detection for BehaviorSubject
        this.guesses$.next([...this.guesses$.value]);

        // if at the last index, set focuessedindex to -1 so the extra icon appears after the guess letterbox.
        const isLastLetter: boolean =
            this.focussedLetterIndex === this.targetName$.value.length! - 1;

        if (isLastLetter) {
            this.focussedLetterIndex = -1;
            this.blurAllLetterBoxes();
        }
        else {
            this.focusLetterBox(this.focussedGuessIndex!, this.focussedLetterIndex! + 1)
        }
    }

    public focusLetterBox(guessIndex: number, letterIndex: number): void {
        this.changeDetectorRef.detectChanges();
        const letterBoxElement = this.getLetterBoxElement(guessIndex, letterIndex);

        if (letterBoxElement) {
            // Remove focus from all letter boxes
            this.blurAllLetterBoxes();

            // Store the foccused guess and letter indexes
            this.focussedGuessIndex = guessIndex;
            this.focussedLetterIndex = letterIndex;

            // Set focus and highlight on the clicked letter box
            letterBoxElement.focus();
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


    private getTargetName(): string[] {
        const randomIndex = Math
            .floor(Math.random() * this.pokemon.length);

        const randomName = this.pokemon[randomIndex];

        let targetName: string[] = [];

        for (let i = 0; i < randomName.length; i++) {
            targetName.push(randomName.charAt(i).toUpperCase());
        }

        return targetName;
    }

    private getCurrentGuess(): Guess {
        return this.guesses$.value
            .find(g => g.guessNumber === this.guessNumber)!;
    }

    private setInitialGuesses(): void {
        const guesses: Guess[] = [];
        for (let i = 1; i <= 6; i++) {
            guesses.push(new Guess(this.targetName$.value, i))
        }
        this.guesses$.next(guesses);
    }

    public toggleGeneration(event: Event, generationNumber: number, dropdown?: NgbDropdown): void {
        event.preventDefault();
        event.stopPropagation();

        // Don't allow deselecting the last generation
        if (this.generations.length === 1 && this.generations.includes(generationNumber)) {
            return;
        }

        if (this.generations.includes(generationNumber)) {
            // Remove generation
            this.generations = this.generations.filter(g => g !== generationNumber);
        } else {
            // Add generation
            this.generations.push(generationNumber);
        }

        // Sort generations for consistent display
        this.generations.sort();

        // Keep dropdown open
        if (dropdown) {
            setTimeout(() => {
                dropdown.open();
            }, 0);
        }
    }

    public getSelectedGenerationsText(): string {
        if (this.generations.length === 0) {
            return 'None';
        }

        const genTexts = this.generations.map(g => `${g}`);
        if (genTexts.length === 1) {
            return genTexts[0];
        } else if (genTexts.length === 2) {
            return genTexts.join(' & ');
        } else {
            const last = genTexts.pop();
            return genTexts.join(', ') + ' & ' + last;
        }
    }

    public resetToGen1(event: Event, dropdown?: NgbDropdown): void {
        event.preventDefault();
        this.generations = [1];

        // Close dropdown after reset
        if (dropdown) {
            dropdown.close();
        }
    }

    public resetGame(): void {
        this.pokemon = this.generationService.getPokemonByGeneration(this.generations);
        this.targetName$.next(this.getTargetName());
        this.targetNameString = this.targetName$.value.filter(l => l !== "").map(l => l).join("");
        this.setInitialGuesses();
        this.guessNumber = 1;
        this.hasFoundWord = false;
        this.gameOver = false;
        this.evaluatingGuess = false;
        this.focussedGuessIndex = 0;
        this.focussedLetterIndex = 0;
        this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex);
    }

    private isValidCharacter(char: string): boolean {
        if (/^[A-Za-z]$/.test(char)) {
            return true;
        }

        return false;
    }

    private handleGuessResult(currentGuess: Guess): void {
        if (currentGuess.isCorrect) {
            this.handleCorrectGuess();
        } else if (this.isFinalGuess()) {
            this.handleFinalGuess();
        } else {
            this.moveToNextGuess();
        }
    }

    private handleCorrectGuess(): void {
        this.blurAllLetterBoxes();
        this.hasFoundWord = true;
        this.gameOver = true;
        this.evaluatingGuess = false;
        this.changeDetectorRef.detectChanges();
    }

    private handleFinalGuess(): void {
        this.gameOver = true;
        this.evaluatingGuess = false;
        this.changeDetectorRef.detectChanges();
    }

    private moveToNextGuess(): void {
        if (this.focussedGuessIndex !== null) {
            this.guessNumber++;
            this.focussedGuessIndex++;
            this.focussedLetterIndex = 0;
            this.focusLetterBox(this.focussedGuessIndex, this.focussedLetterIndex);
            this.evaluatingGuess = false;
            this.changeDetectorRef.detectChanges();
        }
    }

    private isFinalGuess(): boolean {
        return this.guessNumber === 6;
    }
}
