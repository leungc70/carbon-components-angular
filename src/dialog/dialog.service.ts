import {
	EventEmitter,
	Injector,
	ComponentRef,
	ComponentFactory,
	ComponentFactoryResolver,
	Injectable,
	ViewContainerRef
} from "@angular/core";
import { Subscription } from "rxjs";
import { DialogConfig } from "./dialog-config.interface";
import { DialogPlaceholderService } from "./dialog-placeholder.service";

/**
 * `Dialog` object to be injected into other components.
 * @export
 * @class DialogService
 */
@Injectable()
export class DialogService {
	/**
	 * Reflects the open or closed state of the `Dialog`.
	 * @memberof DialogService
	 */
	public isOpen = false;
	/**
	 * To be used to create the component using metadata.
	 * @type {ComponentFactory<any>}
	 * @memberof DialogService
	 */
	public componentFactory: ComponentFactory<any>;
	/**
	 * To emit the `Dialog` closing event.
	 * @type {EventEmitter<any>}
	 * @memberof DialogService
	 */
	public onClose: EventEmitter<any> = new EventEmitter();
	/**
	 * Holds reference to the created `Dialog` component after creation.
	 * @type {ComponentRef<any>}
	 * @memberof DialogService
	 */
	public dialogRef: ComponentRef<any>;

	/**
	 * Emits the state `true` if the Dialog is closed, false if `Dialog`
	 * is opened/viewable.
	 * @type {EventEmitter<any>}
	 * @memberof DialogService
	 */
	isClosed: EventEmitter<any> = new EventEmitter();

	/**
	 * To watch the event that closes the `Dialog`.
	 * @private
	 * @type {Subscription}
	 * @memberof DialogService
	 */
	private dialogSubscription: Subscription;

	/**
	 * Creates an instance of `DialogService`.
	 * @param {ComponentFactoryResolver} componentFactoryResolver
	 * @param {Injector} injector
	 * @memberof DialogService
	 */
	constructor(
		protected componentFactoryResolver: ComponentFactoryResolver,
		protected injector: Injector,
		protected dialogPlaceholderService: DialogPlaceholderService
	) {}

	/**
	 * Uses module `componentFactory` to create the `Dialog` component.
	 * @param {any} component
	 * @memberof DialogService
	 */
	create(component) {
		this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
	}

	/**
	 * Toggles between `Dialog` open/close states.
	 * @param {ViewContainerRef} viewContainer
	 * @param {DialogConfig} dialogConfig
	 * @memberof DialogService
	 */
	toggle(viewContainer: ViewContainerRef, dialogConfig: DialogConfig) {
		if (this.isOpen) {
			this.close(viewContainer);
		} else {
			this.open(viewContainer, dialogConfig);
		}
	}

	/**
	 * If `dialogRef` is defined, the Dialog is already open. If
	 * `dialogRef` is undefined, we create the `Dialog` component and reference to it.
	 * A subscription is created to track if the `Dialog` should close.
	 * @param {ViewContainerRef} viewContainer
	 * @param {DialogConfig} dialogConfig
	 * @memberof DialogService
	 */
	open(viewContainer: ViewContainerRef, dialogConfig: DialogConfig) {
		if (!this.dialogRef) {
			// holder for either the provided view, or the view from DialogPlaceholderService
			let view = viewContainer;
			if (dialogConfig.appendToBody && this.dialogPlaceholderService.viewContainerRef) {
				view = this.dialogPlaceholderService.viewContainerRef;
				// add our component to the view
				this.dialogRef = view.createComponent(this.componentFactory, 0, this.injector);
			} else if (dialogConfig.appendToBody && !this.dialogPlaceholderService.viewContainerRef) {
				// fallback to the old insertion method if the viewref doesn't exist
				this.dialogRef = view.createComponent(this.componentFactory, 0, this.injector);
				setTimeout(() => {
					window.document.querySelector("body").appendChild(this.dialogRef.location.nativeElement);
				});
			} else {
				// add our component to the view
				this.dialogRef = view.createComponent(this.componentFactory, 0, this.injector);
			}

			// initialize some extra options
			let focusedElement = document.activeElement;
			dialogConfig["previouslyFocusedElement"] = focusedElement;
			this.dialogRef.instance.dialogConfig = dialogConfig;
			this.onClose = this.dialogRef.instance.close;
			this.isOpen = true;

			this.dialogSubscription = this.onClose.subscribe(() => {
				this.close(view);
			});

			this.dialogRef.instance.elementRef.nativeElement.focus();
		}
		return this;
	}

	/**
	 * On close of `Dialog` item, sets focus back to previous item, unsets
	 * the current `dialogRef` item. Unsubscribes to the event of `Dialog` close.
	 * @param {ViewContainerRef} viewContainer
	 * @param {any} [evt]
	 * @memberof DialogService
	 */
	close(viewContainer: ViewContainerRef) {
		this.isClosed.emit(true);

		if (this.dialogRef) {
			let elementToFocus = this.dialogRef.instance.dialogConfig["previouslyFocusedElement"];
			if (this.dialogRef.instance.dialogConfig.appendToBody && this.dialogPlaceholderService.viewContainerRef) {
				const vcRef = this.dialogPlaceholderService.viewContainerRef;
				vcRef.remove(vcRef.indexOf(this.dialogRef.hostView));
			} else {
				viewContainer.remove(viewContainer.indexOf(this.dialogRef.hostView));
			}
			this.dialogRef = null;
			this.isOpen = false;
			elementToFocus.focus();

			if (this.dialogSubscription) {
				this.dialogSubscription.unsubscribe();
			}
		}
	}
}
