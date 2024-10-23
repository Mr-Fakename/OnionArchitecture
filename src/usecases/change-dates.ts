import { Conference } from "../domain/entities/conference.entity"
import { User } from "../domain/entities/user.entity"
import { IBookingRepository } from "../interfaces/booking-repository.interface"
import { IConferenceRepository } from "../interfaces/conference-repository.interface"
import { IExecutable } from "../interfaces/executable.interface"
import { IMailer } from "../interfaces/mailer.interface"
import { IUserRepository } from "../interfaces/user-repository.interface"

type ChangeDatesRequest = {
    user: User
    conferenceId: string
    startDate: Date
    endDate: Date
}

type ChangeDatesResponse = void

export class ChangeDates implements IExecutable<ChangeDatesRequest, ChangeDatesResponse> {

    constructor(
        private readonly conferenceRepository: IConferenceRepository,
        private readonly mailer: IMailer,
        private readonly bookingRepository: IBookingRepository,
        private readonly userRepository: IUserRepository
    ){}

    async execute({user, conferenceId, startDate, endDate}: ChangeDatesRequest): Promise<void> {
        const conference = await this.conferenceRepository.findById(conferenceId)

        conference!.update({startDate, endDate})

        await this.conferenceRepository.update(conference!)
        await this.sendEmailToParticipants(conference!)
        
    }

    async sendEmailToParticipants(conference: Conference) {
        const bookings = await this.bookingRepository.findByConferenceId(conference.props.id) // [{userId, conferenceId}, {}]
        const users = await Promise.all(
            bookings.map(booking => this.userRepository.findById(booking.props.userId))
                    .filter(user => user !== null)
        ) as User[]

        await Promise.all(
            users.map(user => {
                this.mailer.send({
                    from: 'TEDx Conference',
                    to: user.props.email,
                    subject: 'Conference dates were updated',
                    body: `The conference with title: ${conference!.props.title} has updated its dates`
                })
            })
        )
    }
}