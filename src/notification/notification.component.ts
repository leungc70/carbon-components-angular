import {
	Component,
	Input,
	Output,
	EventEmitter,
	ComponentRef,
	ViewChild,
	OnInit,
	HostBinding
} from "@angular/core";

import { NotificationService } from "./notification.service";
import { NotificationContent } from "./notification-content.interface";
import { I18n } from "./../i18n/i18n.module";

/**
 * Notification messages are displayed toward the top of the UI and do not interrupt user’s work.
 *
 * @export
 * @class Notification
 */
@Component({
	selector: "ibm-notification",
	template: `
		<div class="bx--inline-notification__details">
			<svg class="bx--inline-notification__icon" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
				<path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM3.293 4.707l8 8 1.414-1.414-8-8-1.414 1.414z" fill-rule="evenodd"/>
			</svg>
			<div class="bx--inline-notification__text-wrapper">
				<p [innerHTML]="notificationObj.title" class="bx--inline-notification__title"></p>
				<p [innerHTML]="notificationObj.message" class="bx--inline-notification__subtitle"></p>
			</div>
		</div>
		<button
			(click)="onClose()"
			class="bx--inline-notification__close-button"
			[attr.aria-label]="notificationObj.closeLabel"
			type="button">
			<svg
				class="bx--inline-notification__close-icon"
				width="10"
				height="10"
				viewBox="0 0 10 10"
				xmlns="http://www.w3.org/2000/svg">
				<path d="M6.32 5L10 8.68 8.68 10 5 6.32 1.32 10 0 8.68 3.68 5 0 1.32 1.32 0 5 3.68 8.68 0 10 1.32 6.32 5z" fill-rule="nonzero"/>
			</svg>
		</button>
	`,
	providers: [NotificationService]
})
export class Notification implements OnInit {
	/**
	 * Can have `type`, `title`, and `message` members.
	 *
	 * `type` can be one of `"info"`, `"warning"`, `"danger"`, `"success"`
	 *
	 * `message` is message for notification to display
	 *
	 */
	@Input() notificationObj: NotificationContent;

	/**
	 * Emits on close.
	 *
	 * @type {EventEmitter<any>}
	 * @memberof Notification
	 */
	@Output() close: EventEmitter<any> = new EventEmitter();

	componentRef: ComponentRef<Notification>;

	@ViewChild("notification") notification;

	@HostBinding("attr.id") notificationID = "notification";
	@HostBinding("class.bx--inline-notification") notificationClass = true;
	@HostBinding("attr.role") role = "alert";

	@HostBinding("class.bx--inline-notification--error") get isError() { return this.notificationObj.type === "error"; }
	@HostBinding("class.bx--inline-notification--info") get isInfo() { return this.notificationObj.type === "info"; }
	@HostBinding("class.bx--inline-notification--success") get isSuccess() { return this.notificationObj.type === "success"; }
	@HostBinding("class.bx--inline-notification--warning") get isWarning() { return this.notificationObj.type === "warning"; }

	constructor(protected notificationService: NotificationService, protected i18n: I18n) {}

	ngOnInit() {
		if (!this.notificationObj.closeLabel) {
			this.notificationObj.closeLabel = this.i18n.get().NOTIFICATION.CLOSE_BUTTON;
		}
	}

	/**
	 * Emits close event.
	 *
	 * @memberof Notification
	 */
	onClose() {
		this.close.emit();
	}

	destroy() {
		this.notificationService.close(this);
	}
}
