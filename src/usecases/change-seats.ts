import {User} from "../domain/entities/user.entity";
import {IConferenceRepository} from "../interfaces/conference-repository.interface";
import {IExecutable} from "../interfaces/executable.interface";
import {IBookingRepository} from "../interfaces/booking-repository.interface";

type ChangeSeatsRequest = {
    user: User
    conferenceId: string
    seats: number
}

type ChangeSeatsResponse = void

export class ChangeSeats implements IExecutable<ChangeSeatsRequest, ChangeSeatsResponse> {

    constructor(
        private readonly repository: IConferenceRepository,
        private readonly bookingRepository: IBookingRepository
    ) {
    }

    async execute({user, conferenceId, seats}: ChangeSeatsRequest): Promise<ChangeSeatsResponse> {
        const conference = await this.repository.findById(conferenceId)

        if (!conference) throw new Error("Conference not found")

        if (!conference.isTheOrganizer(user)) {
            throw new Error("You are not allowed to change this conference")
        }

        const bookings = await this.bookingRepository.findByConferenceId(conferenceId)
        if (bookings.length > seats) {
            throw new Error("Number of seats cannot be inferior to the number of attendees")
        }

        conference.update({seats})

        if (conference.hasTooManySeats()) throw new Error("Conference has too many seats")
        if (conference.hasNotEnoughSeats()) throw new Error("Conference has not enough seats")


        await this.repository.update(conference)
    }
}