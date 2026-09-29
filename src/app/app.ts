import { Navbar } from './domain/components/navbar/navbar';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  template:'<app-navbar class="print:hidden block" /> <main> <router-outlet></router-outlet></main>'

})
export class App {
  protected readonly title = signal('credencialpp-frontend');
}
