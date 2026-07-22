import { Coaching, CoachingQuery, GetAllCoachingResponse, UpdateCoaching } from "./coaching.interface";

export interface ICoachingRepository{
    createCoaching(data: Coaching): Promise<void>;
   getCoaching(query: CoachingQuery): Promise<GetAllCoachingResponse>;
   getCoachingServiceById(serviceId: string): Promise<Coaching| null>;
    updateCoachingService(serviceId: string, data: UpdateCoaching): Promise<void>;
    toggleCoachingStatus(serviceId: string): Promise<Coaching | null>;

}