import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { AppError } from "@/utils/appError";
import { SetupAvailabilityDto, SetupUnavailabilityDto, UnavailabilityType } from "../dto/trainer-scheduling.dto";

export function validateLeaveType(
    type: UnavailabilityType
): void {

    const allowedTypes = [
        "VACATION",
        "MEDICAL_LEAVE",
        "EMERGENCY",
        "PERSONAL_LEAVE",
    ];

    if (!allowedTypes.includes(type)) {
        throw new AppError(
            STATUS.BAD_REQUEST,
            "Invalid leave type."
        );
    }
}


export function validateLeaveDates(
    startDate: Date | string,
    endDate: Date | string
): void {

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime())
    ) {
        throw new AppError(
            STATUS.BAD_REQUEST,
            "Invalid leave dates."
        );
    }

    if (end < start) {
        throw new AppError(
            STATUS.BAD_REQUEST,
            "Leave end date cannot be before start date."
        );
    }
}

export function validateLeaveReason(
    reason?: string
): void {

    if (!reason) return;

    if (reason.trim().length > 500) {
        throw new AppError(
            STATUS.BAD_REQUEST,
            "Leave reason exceeds maximum length."
        );
    }
}

export function validateLeaveInsideAvailability(
    startDate: Date,
    endDate: Date,
    effectiveFrom: Date,
    effectiveUntil: Date,
): void {

    const leaveStart = new Date(startDate);
    const leaveEnd = new Date(endDate);

    const availabilityStart =
        new Date(effectiveFrom);

    const availabilityEnd =
        new Date(effectiveUntil);

    if (
        leaveStart < availabilityStart ||
        leaveEnd > availabilityEnd
    ) {
        throw new AppError(
            STATUS.BAD_REQUEST,
            "Leave must fall within the availability period."
        );
    }
}


export function validateDuplicateLeave(
    leaves: SetupUnavailabilityDto[]
): void {

    const seen = new Set<string>();

    for (const leave of leaves) {

        const key =
            `${leave.type}-${String(leave.startDate)}-${String(leave.endDate)}`;

        if (seen.has(key)) {
            throw new AppError(
                STATUS.BAD_REQUEST,
                "Duplicate leave detected."
            );
        }

        seen.add(key);
    }
}


export function validateLeaveOverlap(
    leaves: SetupUnavailabilityDto[]
): void {

    const sorted = [...leaves].sort(
        (a, b) =>
            new Date(a.startDate).getTime() -
            new Date(b.startDate).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {

        const previous =
            new Date(sorted[i - 1].endDate);

        const current =
            new Date(sorted[i].startDate);

        if (current <= previous) {
            throw new AppError(
                STATUS.BAD_REQUEST,
                "Overlapping leave periods are not allowed."
            );
        }
    }
}

export function validateTrainerUnavailabilities(
    leaves: SetupUnavailabilityDto[],
    availability?: SetupAvailabilityDto
): void {

    validateDuplicateLeave(leaves);

    validateLeaveOverlap(leaves);

    for (const leave of leaves) {

        validateLeaveType(
            leave.type
        );

        validateLeaveDates(
            leave.startDate,
            leave.endDate
        );

        validateLeaveReason(
            leave.reason
        );

        if (availability) {
          validateLeaveInsideAvailability(
              leave.startDate,
              leave.endDate,
              availability.effectiveFrom,
              availability.effectiveUntil
          );
        }
    }
}