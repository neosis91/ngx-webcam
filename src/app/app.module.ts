import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {WebcamComponent} from './modules/webcam/webcam/webcam.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    WebcamComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
