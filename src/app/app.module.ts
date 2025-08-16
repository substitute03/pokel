import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { LetterboxesComponent } from './letterboxes/letterboxes.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        GameScreenComponent,
        LetterboxesComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', component: GameScreenComponent, pathMatch: 'full' },
            { path: '**', component: GameScreenComponent } // wildcard path if the path doesn't match anything
        ]),
        NgbModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
