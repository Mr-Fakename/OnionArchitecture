import {User} from "../domain/entities/user.entity";
import {IConferenceRepository} from "../interfaces/conference-repository.interface";
import {IExecutable} from "../interfaces/executable.interface";
import {IBookingRepository} from "../interfaces/booking-repository.interface";
import {Booking} from "../domain/entities/booking.entity";
import {IMailer} from "../interfaces/mailer.interface";
import {Conference} from "../domain/entities/conference.entity";
import {IUserRepository} from "../interfaces/user-repository.interface"


type BookingSeatsRequest = {
    user: User
    conferenceId: string
}

type BookingSeatsResponse = void

export class BookSeats implements IExecutable<BookingSeatsRequest, BookingSeatsResponse> {
    constructor(
        private readonly conferenceRepository: IConferenceRepository,
        private readonly bookingRepository: IBookingRepository,
        private readonly mailer: IMailer,
        private readonly userRepository: IUserRepository,
    ) {
    }

    async execute({user, conferenceId}: BookingSeatsRequest): Promise<BookingSeatsResponse> {
        const conference = await this.conferenceRepository.findById(conferenceId);

        if (!conference) {
            throw new Error("Conference not found");
        }

        const bookings = await this.bookingRepository.findByConferenceId(conferenceId)

        if (conference.props.seats < bookings.length + 1) {
            throw new Error("Not enough seats available");
        }

        const booking = new Booking({conferenceId, userId: user.props.id});
        await this.bookingRepository.create(booking);
        await this.sendEmailToParticipant(conference, user);
    }

    private async sendEmailToParticipant(conference: Conference, user: User) {
        await this.mailer.send({
            from: 'TEDx Conference',
            to: user.props.email,
            subject: 'You have successfully booked a seat',
            body: `You have successfully booked a seat for the conference: ${conference.props.title}`
        })
    }
}