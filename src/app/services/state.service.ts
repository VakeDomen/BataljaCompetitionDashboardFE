import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  
  private me: User | undefined;

  constructor() { }
  
  
  setMe(me: User) {
    this.me = me;
  }
}
