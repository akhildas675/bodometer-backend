import { CoachingDetailDto } from "../dto/coaching.dto";
import { Coaching } from "../interface/coaching.interface";

export class CoachingMapper {

    static toDto(coaching: Coaching): CoachingDetailDto {
        return {
            serviceId: coaching.serviceId,
            serviceType: coaching.serviceType,
            description: coaching.description,
            durationMinutes: coaching.durationMinutes,
            price: coaching.price,
            bookingMode: coaching.bookingMode,
            isActive: coaching.isActive ?? false,
        };
    }

}