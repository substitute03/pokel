import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'pok-endgame-modal',
    templateUrl: './endgame-modal.component.html',
    styleUrls: ['./endgame-modal.component.css']
})
export class EndgameModalComponent {

    @Input() hasFoundWord: boolean = false;
    @Input() targetNameString: string = '';
    @Input() targetSprite: string = '';
    @Input() targetPokedexEntry: string = '';
    @Input() pokemonNumber: number = 0;

    constructor(public activeModal: NgbActiveModal) { }

    close(): void {
        this.activeModal.close();
    }

    resetGame(): void {
        this.activeModal.close('reset');
    }

    getPokemonNumber(): string {
        return this.pokemonNumber ? this.pokemonNumber.toString().padStart(3, '0') : '???';
    }
}
