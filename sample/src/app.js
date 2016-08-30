import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {EditPerson} from './edit-person';

@inject(DialogService)
export class App {
  constructor(dialogService) {
    this.dialogService = dialogService;
    this.showExtraData = true;
  }

  open() {
    console.log('*** open');
    this.dialogService.open({viewModel: EditPerson }).then(result => {
      console.log('*** open - closed normally.');
    });
  }

  openUsingIncorrectModuleId() {
    console.log('*** openUsingIncorrectModuleId');
    this.dialogService.open({viewModel: 'incorrect-module-id'}).then(result => {
      console.log('*** openUsingIncorrectModuleId - closed normally.');
    }, e => {
      console.log('*** openUsingIncorrectModuleId - could not open dialog');
    });
  }

  openUsingVMWithError(errorLocation) {
    console.log(`*** openUsingVMWithError in ${errorLocation}`);
    EditPerson.throwIn = errorLocation;
    this.dialogService.open({viewModel: EditPerson}).then(result => {
      console.log('*** openUsingVMWithError - closed normally.');
    }, e => {
      console.log(`*** openUsingVMWithError - could not open dialog.] Error: ${e.message}`);
    });
  }
}
