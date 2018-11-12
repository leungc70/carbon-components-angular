import {
	Component,
	Input,
	ElementRef,
	AfterViewInit
} from "@angular/core";
import { Http } from "@angular/http";
import { IconService } from "./icon.service";

/**
 * Used to load sprites and is generally used at the root of the application.
 * Page specific sprites may be loaded on that page, but do note that may result in unintened network requets.
 */
@Component({
	selector: "ibm-sprite",
	template: ``,
	styles: [`
		:host {
			display: none;
			height: 0;
			width: 0;
		}
	`],
	providers: [IconService]
})
export class Sprite implements AfterViewInit {
	/** name used to request sprite from the baseURL */
	@Input() sprite = "";

	/**
	 * instantiate the component and instances of http and iconService
	 *
	 * @param {Http} http
	 * @param {ElementRef} _elementRef
	 * @param {IconService} icons
	 */
	constructor(protected http: Http,
		protected _elementRef: ElementRef,
		protected icons: IconService) {}

	/** load the sprite and inject it into the rendered DOM */
	ngAfterViewInit() {
		this.icons.getSprite(this.sprite).subscribe(rawSVG => {
			this._elementRef.nativeElement.innerHTML = rawSVG;
			// insure the DOM has settled before we tell everyone they can request icons
			// TODO: move all the sprites into in memory data structures
			setTimeout(() => {
				IconService.spriteLoaded.emit();
			});
		});
	}
}
