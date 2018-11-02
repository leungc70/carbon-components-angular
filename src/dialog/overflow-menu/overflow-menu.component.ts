import { Component, ElementRef, Input } from "@angular/core";
import { I18n } from "./../../i18n/i18n.module";

/**
 * The OverFlow menu component encapsulates the OverFlowMenu directive, and the menu iconography into one convienent component
 *
 * html:
 * ```
 * <ibm-overflow-menu>
 *	<ibm-overflow-menu-option>Option 1</ibm-overflow-menu-option>
 *	<ibm-overflow-menu-option>Option 2</ibm-overflow-menu-option>
 * </ibm-overflow-menu>
 * ```
 */
@Component({
	selector: "ibm-overflow-menu",
	template: `
		<div
			[ibmOverflowMenu]="options"
			[ngClass]="{'bx--overflow-menu--open': open === true}"
			[attr.aria-label]="buttonLabel"
			[flip]="flip"
			class="bx--overflow-menu"
			placement="bottom"
			style="display: block;"
			tabindex="0">
			<svg class="bx--overflow-menu__icon" width="3" height="15" viewBox="0 0 3 15">
				<g fill-rule="evenodd">
					<circle cx="1.5" cy="1.5" r="1.5" />
					<circle cx="1.5" cy="7.5" r="1.5" />
					<circle cx="1.5" cy="13.5" r="1.5" />
				</g>
			</svg>
		</div>
		<ng-template #options>
			<ng-content></ng-content>
		</ng-template>
	`,
	styles: [`
		.bx--overflow-menu--open {
			opacity: 1
		}
	`]
})
export class OverflowMenu {

	@Input() buttonLabel = this.i18n.get().OVERFLOW_MENU.OVERFLOW;

	@Input() flip = false;

	constructor(protected elementRef: ElementRef, protected i18n: I18n) {}

	get open() {
		if (this.elementRef.nativeElement.children[0].getAttribute("aria-expanded") === "true") {
			return true;
		}
		return false;
	}
}
