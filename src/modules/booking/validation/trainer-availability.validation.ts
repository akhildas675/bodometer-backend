import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { IANAZone } from "luxon";
import { SetupAvailabilityDto, WeeklyScheduleDto } from "../dto/trainer-scheduling.dto";

export function validateAvailabilityDates(
    effectiveFrom: Date,
    effectiveUntil: Date,
):void{
    const fromDate = new Date(effectiveFrom);
    const untilDate = new Date(effectiveUntil);

    if(Number.isNaN(fromDate.getTime())|| Number.isNaN(untilDate.getTime())){
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.INVALID_SHIFT_DURATION);
    }

    if(fromDate >= untilDate){
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.INVALID_TIME_RANGE);
    }
}

export function validateTimezone(timeZone: string):void{
    if(!timeZone || !IANAZone.isValidZone(timeZone)){
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.INVALID_TIMEZONE);
    }
}


export function validateAtLeastOneAvailableDay(
    weeklySchedule: WeeklyScheduleDto[],
):void{
   const hasAvailableDay = weeklySchedule.some(day => day.isAvailable && day.shifts.length > 0);
   if (!hasAvailableDay) {
       throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.ONE_WORKING_DAY_REQUIRED);
   }
}


export function validateAvailableDayShifts(
    weeklySchedule: WeeklyScheduleDto[],
):void{
    for (const day of weeklySchedule) {
        if(day.isAvailable && day.shifts.length === 0){
            throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.EMPTY_SHIFT);
        }
        if(!day.isAvailable && day.shifts.length > 0){
            throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.EMPTY_SHIFT);
        }
    }

}


export function validateShiftMinuteRange(
    weeklySchedule: WeeklyScheduleDto[],
):void{
    for(const day of weeklySchedule){
        for( const shift of day.shifts){
            if(
                typeof shift.startMinute !== "number" ||
                typeof shift.endMinute !== "number" ||
                shift.startMinute < 0 || shift.startMinute >= 1440 ||
                shift.endMinute <= 0 || shift.endMinute > 1440
            ){
                throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.INVALID_SHIFT_DURATION);
            }

            if(shift.startMinute >= shift.endMinute){
                throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.INVALID_TIME_RANGE);
            }
        }
    }
}


export function validateNoOverlappingShifts(
    weeklySchedule: WeeklyScheduleDto[],
):void{
    for(const day of weeklySchedule){
        if(day.shifts.length <= 1) continue;
        const sortedShifts = [...day.shifts].sort((a, b) => a.startMinute - b.startMinute);

        for(let i = 1; i < sortedShifts.length; i++){
            const previous = sortedShifts[i - 1];
            const current = sortedShifts[i];
            if(current.startMinute < previous.endMinute){
                throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.SHIFT_OVERLAP);
            }
        }
    }
}

export function validateTrainerAvailability(
  availability: SetupAvailabilityDto,
): void {

  validateAvailabilityDates(
    availability.effectiveFrom,
    availability.effectiveUntil,
  );

  validateTimezone(
    availability.timeZone,
  );

  validateAtLeastOneAvailableDay(
    availability.weeklySchedule,
  );

  validateAvailableDayShifts(
    availability.weeklySchedule,
  );

  validateShiftMinuteRange(
    availability.weeklySchedule,
  );

  validateNoOverlappingShifts(
    availability.weeklySchedule,
  );
}