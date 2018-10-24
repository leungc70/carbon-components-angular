import {
	Component,
	Input,
	OnInit
} from "@angular/core";
import { DateTimeModel } from "./../date-time-model.class";
import { range } from "../../common/utils";

@Component({
	selector: "ibm-calendar-quarter-view",
	template: `
	<div class="calendar-view">
		<ibm-calendar-header [currentView]="currentView" header="yearOnly"></ibm-calendar-header>
		<table class="calendar_grid">
			<tr
			class="grid_row--quarters"
			*ngFor="let i of range(2)">
				<td
				*ngFor="let j of range(2)"
				(click)="selectQuarter(i * 2 + j)"
				[ngClass]="{
					'today': isCurrentQuarter(i * 2 + j),
					'selected': isSelected(i * 2 + j),
					'range': inRange(i * 2 + j),
					'disabled': isDisabled(i * 2 + j)
				}">
					<div>
						<p class="top">
							{{quarters[i * 2 + j].name}}
						</p>
						<p class="bottom">
							{{quarters[i * 2 + j].months}}
						</p>
					</div>
				</td>
			</tr>
		</table>
	</div>
	`
})
export class CalendarQuarter implements OnInit {
	/**
	 * `DateTimeModel` to be used in this view.
	 *
	 * @type {DateTimeModel}
	 * @memberof CalendarMonths
	 */
	@Input() model: DateTimeModel;

	/**
	 * `Date` being used in this view.
	 *
	 * @type {Date}
	 * @memberof CalendarMonths
	 */
	currentView: Date = new Date();

	/**
	 * State to determine whether you are selecting `startDate` or `endDate`
	 *
	 * @memberof CalendarMonths
	 */
	rangeSelectionInProgress = false;

	/**
	 * Initialization of quarter object for translation
	 *
	 * @type {Array<any>}
	 * @memberof CalendarQuarter
	 */
	quarters: Array<any>;

	/**
	 * Creates an instance of CalendarQuarter.
	 * Translates quarters.
	 * @param {TranslateService} translate
	 * @memberof CalendarQuarter
	 */
	constructor() {
		// this.translate.get("CALENDAR.QUARTERS").subscribe((res: Array<any>) => {
		// 	this.quarters = res;
		// });
	}

	ngOnInit() {
		this.currentView = new Date(this.model.startDate);

		if (!this.currentView || isNaN(this.currentView.getTime())) {
			this.currentView = new Date();
		}
	}

	/**
	 * Wrapper for `range` function in utils because it cannot
	 * be directly used in template
	 *
	 * @param {number} stop
	 * @param {number} [start=0]
	 * @param {number} [step=1]
	 * @returns Array<any>
	 * @memberof CalendarMonths
	 */
	range(stop: number, start = 0, step = 1) {
		return range(stop, start, step);
	}

	/**
	 * Returns value indicating whether `quarter` is current quarter
	 *
	 * @param {number} quarter of year
	 * @returns boolean
	 * @memberof CalendarQuarter
	 */
	isCurrentQuarter(quarter: number) {
		const now = new Date();

		return (
			this.currentView.getFullYear() === now.getFullYear() &&
			quarter === Math.floor(now.getMonth() / 3)
		);
	}

	/**
	 * Returns value indicating whether `quarter` is disabled
	 *
	 * @param {number} quarter of year
	 * @returns boolean
	 * @memberof CalendarQuarter
	 */
	isDisabled(quarter: number) {
		return this.model.isDateDisabled(new Date(this.currentView.getFullYear(), quarter * 4, 1));
	}

	/**
	 * Returns value indicating whether `quarter` is part of a range selection
	 *
	 * @param {number} quarter of year
	 * @returns boolean
	 * @memberof CalendarQuarter
	 */
	inRange(quarter: number) {
		return this.model.isDateInRange(new Date(this.currentView.getFullYear(), quarter * 4, 1));
	}

	/**
	 * Returns value indicating whether `quarter` is selected
	 *
	 * @param {number} quarter
	 * @returns
	 * @memberof CalendarQuarter
	 */
	isSelected(quarter: number) {
		return (
			this.currentView.getFullYear() === this.model.startDate.getFullYear() && quarter === Math.floor(this.model.startDate.getMonth() / 3)
			|| this.currentView.getFullYear() === this.model.endDate.getFullYear() && quarter === Math.floor(this.model.endDate.getMonth() / 3)
		);
	}

	/**
	 * Sets model's `startDate` and `endDate`
	 *
	 * @param {number} quarter
	 * @memberof CalendarQuarter
	 */
	selectQuarter(quarter: number) {
		if (this.isDisabled(quarter)) {
			return;
		}
		if (this.rangeSelectionInProgress) {
			this.rangeSelectionInProgress = false;
			this.model.selectQuarterEnd(quarter, this.currentView.getFullYear());
			if (this.model.startDate.getTime() > this.model.endDate.getTime()) {
				const tmp = this.model.startDate;
				this.model.startDate = this.model.endDate;
				this.model.endDate = tmp;
			}
		} else {
			this.rangeSelectionInProgress = true;
			this.model.selectQuarter(quarter, this.currentView.getFullYear());
		}
	}
}
