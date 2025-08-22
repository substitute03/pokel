import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'pok-help-modal',
    templateUrl: './help-modal.component.html',
    styleUrls: ['./help-modal.component.css']
})
export class HelpModalComponent {

    constructor(public activeModal: NgbActiveModal) { }

    close(): void {
        this.activeModal.close();
    }
}
