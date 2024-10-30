import { Component, Input, NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { W3MCoreButtonComponentWrapperComponent } from './w3-mcore-button-component-wrapper/w3-mcore-button-component-wrapper.component';
import { CommonModule } from "@angular/common";

// Web Components Wrapper module
@NgModule({
    declarations: [ W3MCoreButtonComponentWrapperComponent],
    exports: [W3MCoreButtonComponentWrapperComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports:[CommonModule]
})
export class Web3ModalCoreButtonWrapperModule {}