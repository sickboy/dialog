var _class, _temp;

import { Origin } from 'aurelia-metadata';
import { Container } from 'aurelia-dependency-injection';
import { CompositionEngine, ViewSlot } from 'aurelia-templating';
import { DialogController } from './dialog-controller';
import { Renderer } from './renderer';
import { invokeLifecycle } from './lifecycle';
import { DialogResult } from './dialog-result';
import { dialogOptions } from './dialog-options';

export let DialogService = (_temp = _class = class DialogService {

  constructor(container, compositionEngine) {
    this.container = container;
    this.compositionEngine = compositionEngine;
    this.controllers = [];
    this.hasActiveDialog = false;
  }

  open(settings) {
    let childContainer = this.container.createChild();
    let dialogController;
    let promise = new Promise((resolve, reject) => {
      dialogController = new DialogController(childContainer.get(Renderer), _createSettings(settings), resolve, reject);
    });
    childContainer.registerInstance(DialogController, dialogController);

    return _openDialog(this, childContainer, dialogController).then(() => promise).then(result => {
      _removeController(this, dialogController);
      return result;
    });
  }

  openAndYieldController(settings) {
    let childContainer = this.container.createChild();
    let dialogController = new DialogController(childContainer.get(Renderer), _createSettings(settings), null, null);
    childContainer.registerInstance(DialogController, dialogController);

    dialogController.result = new Promise((resolve, reject) => {
      dialogController._resolve = resolve;
      dialogController._reject = reject;
    }).then(result => {
      _removeController(this, dialogController);
      return result;
    });

    return _openDialog(this, childContainer, dialogController).then(() => {
      return dialogController;
    });
  }
}, _class.inject = [Container, CompositionEngine], _temp);

function _createSettings(settings) {
  settings = Object.assign({}, dialogOptions, settings);
  settings.startingZIndex = dialogOptions.startingZIndex;
  return settings;
}

function _openDialog(service, childContainer, dialogController) {
  let host = dialogController.renderer.getDialogContainer();
  let instruction = {
    container: service.container,
    childContainer: childContainer,
    model: dialogController.settings.model,
    view: dialogController.settings.view,
    viewModel: dialogController.settings.viewModel,
    viewSlot: new ViewSlot(host, true),
    host: host
  };

  return _getViewModel(instruction, service.compositionEngine).then(returnedInstruction => {
    dialogController.viewModel = returnedInstruction.viewModel;
    dialogController.slot = returnedInstruction.viewSlot;

    return invokeLifecycle(dialogController.viewModel, 'canActivate', dialogController.settings.model).then(canActivate => {
      if (canActivate) {
        service.controllers.push(dialogController);
        service.hasActiveDialog = !!service.controllers.length;

        return service.compositionEngine.compose(returnedInstruction).then(controller => {
          dialogController.controller = controller;
          dialogController.view = controller.view;

          return dialogController.renderer.showDialog(dialogController);
        }).catch(e => {
          _removeController(service, dialogController);
          return Promise.reject(e);
        });
      }
    });
  });
}

function _getViewModel(instruction, compositionEngine) {
  if (typeof instruction.viewModel === 'function') {
    instruction.viewModel = Origin.get(instruction.viewModel).moduleId;
  }

  if (typeof instruction.viewModel === 'string') {
    return compositionEngine.ensureViewModel(instruction);
  }

  return Promise.resolve(instruction);
}

function _removeController(service, controller) {
  let i = service.controllers.indexOf(controller);
  if (i !== -1) {
    service.controllers.splice(i, 1);
    service.hasActiveDialog = !!service.controllers.length;
  }
}