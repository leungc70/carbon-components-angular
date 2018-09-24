/**
 * Utilites to manipulate the position of elements relative to other elements
 *
 * @export
 */

// possible positions ... this should probably be moved (along with some other types) to some central location
export type Placement =
	"left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left-bottom" | "right-bottom";

export interface AbsolutePosition {
	top: number;
	left: number;
	position?: AbsolutePosition;
}

export type Offset = { left: number, top: number };

function calculatePosition(referenceOffset: Offset, reference: HTMLElement, target: HTMLElement, placement: Placement): AbsolutePosition {
	// calculate offsets for a given position
	const referenceRect = reference.getBoundingClientRect();
	switch (placement) {
		case "left":
			return {
				top: referenceOffset.top - Math.round(target.offsetHeight / 2) + Math.round(referenceRect.height / 2),
				left: Math.round(referenceOffset.left - target.offsetWidth)
			};
		case "right":
			return {
				top: referenceOffset.top - Math.round(target.offsetHeight / 2) + Math.round(referenceRect.height / 2),
				left: Math.round(referenceOffset.left + referenceRect.width)
			};
		case "top":
			return {
				top: Math.round(referenceOffset.top - target.offsetHeight),
				left: referenceOffset.left - Math.round(target.offsetWidth / 2) + Math.round(referenceRect.width / 2)
			};
		case "bottom":
			return {
				top: Math.round(referenceOffset.top + referenceRect.height),
				left: referenceOffset.left - Math.round(target.offsetWidth / 2) + Math.round(referenceRect.width / 2)
			};
		case "left-bottom":
			return {
				// 22 == half of popover header height
				top: referenceOffset.top - 22 + Math.round(referenceRect.height / 2),
				left: Math.round(referenceOffset.left - target.offsetWidth)
			};
		case "right-bottom":
			return {
				top: referenceOffset.top - 22 + Math.round(referenceRect.height / 2),
				left: Math.round(referenceOffset.left + referenceRect.width)
			};
		// matter currently doesn't support these, so the popover is broken anyway
		case "top-left":
			return {
				top: 0,
				left: 0
			};
		case "top-right":
			return {
				top: 0,
				left: 0
			};
		case "bottom-left":
			return {
				top: referenceOffset.top + referenceRect.height,
				left: referenceOffset.left + referenceRect.width - target.offsetWidth
			};
		case "bottom-right":
			return {
				top: referenceOffset.top + referenceRect.height,
				left: referenceOffset.left
			};
	}
}

export namespace position {
	export function getRelativeOffset(target: HTMLElement): Offset {
		// start with the inital element offsets
		let offsets = {
			left: target.offsetLeft,
			top: target.offsetTop
		};
		// get each static (i.e. not absolute or relative) offsetParent and sum the left/right offsets
		while (target.offsetParent && getComputedStyle(target.offsetParent).position === "static") {
			offsets.left += target.offsetLeft;
			offsets.top += target.offsetTop;
			target = target.offsetParent as HTMLElement;
		}
		return offsets;
	}

	export function getAbsoluteOffset(target: HTMLElement): Offset {
		return {
			top: target.getBoundingClientRect().top,
			left: target.getBoundingClientRect().left - document.body.getBoundingClientRect().left
		};
	}

	// finds the position relative to the `reference` element
	export function findRelative(reference: HTMLElement, target: HTMLElement, placement: Placement): AbsolutePosition {
		const referenceOffset = getRelativeOffset(reference);
		return calculatePosition(referenceOffset, reference, target, placement);
	}

	export function findAbsolute(reference: HTMLElement, target: HTMLElement, placement: Placement): AbsolutePosition {
		const referenceOffset = getAbsoluteOffset(reference);
		return calculatePosition(referenceOffset, reference, target, placement);
	}

	export function findPosition(reference: HTMLElement,
		target: HTMLElement,
		placement: Placement,
		offsetFunction = getRelativeOffset): AbsolutePosition {
		const referenceOffset = offsetFunction(reference);
		return calculatePosition(referenceOffset, reference, target, placement);
	}

	/** check if the placement is within the window. */
	export function checkPlacement(target: HTMLElement, position: AbsolutePosition): boolean {
		const elTop = position.top;
		const elLeft = position.left;
		const elBottom = target.offsetHeight + position.top;
		const elRight = target.offsetWidth + position.left;
		const windowTop = window.scrollY;
		const windowLeft = window.scrollX;
		// remove the target height so we get a reasonably accurate window height reading
		const windowBottom = (window.innerHeight + window.scrollY) - target.offsetHeight;
		const windowRight = window.innerWidth + window.scrollX;

		if (elBottom < windowBottom && elRight < windowRight && elTop > windowTop && elLeft > windowLeft) {
			return true;
		}
		return false;
	}

	export function addOffset(position: AbsolutePosition, top = 0, left = 0): AbsolutePosition {
		return Object.assign({}, position, {
			top: position.top + top,
			left: position.left + left
		});
	}

	export function setElement(element: HTMLElement, position: AbsolutePosition): void {
		element.style.top = `${position.top}px`;
		element.style.left = `${position.left}px`;
	}
}

export default position;
