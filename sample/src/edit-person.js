import {DialogController} from 'aurelia-dialog';

export class EditPerson {
  static inject = [DialogController];

  constructor(controller){
    if (EditPerson.throwIn === 'constructor') {
      EditPerson.throwIn = undefined;
      throw new Error('Error occured in the constructor');
    }
    this.controller = controller;
    this.controller.settings.lock = false;
  }
  
  activate(person) {
    if (EditPerson.throwIn === 'activate') {
      EditPerson.throwIn = undefined;
      throw new Error('Error occured in the .activate()');
    }
  }
}