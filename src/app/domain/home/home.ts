import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Upload } from "../upload/upload";
import { Navbar } from '../components/navbar/navbar';


@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Upload, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
