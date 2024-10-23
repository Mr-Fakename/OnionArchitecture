import { ChangeDates } from "../../usecases/change-dates"
import { InMemoryBookingRepository } from "../in-memory/in-memory-booking-repository"
import { InMemoryConferenceRepository } from "../in-memory/in-memory-conference-repository"
import { InMemoryMailer } from "../in-memory/in-memory-mailer"
import { InMemoryUserRepository } from "../in-memory/in-memory-user-repository"
import { testBookings } from "./seeds/seeds-booking"
import { testConferences } from "./seeds/seeds-conference"
import { testUsers } from "./seeds/seeds-user"

describe('Usecase: Change dates', () => {
    let conferenceRepository: InMemoryConferenceRepository
    let bookingRepository: InMemoryBookingRepository
    let userRepository: InMemoryUserRepository
    let mailer: InMemoryMailer
    let usecase: ChangeDates

    beforeEach(async () => {
        conferenceRepository = new InMemoryConferenceRepository()
        await conferenceRepository.create(testConferences.conference)

        bookingRepository = new InMemoryBookingRepository()
        await bookingRepository.create(testBookings.aliceBooking)

        userRepository = new InMemoryUserRepository()
        await userRepository.create(testUsers.alice)

        mailer = new InMemoryMailer()
        usecase = new ChangeDates(conferenceRepository, mailer, bookingRepository, userRepository)
    })

    describe('Scenario: Happy path', () => {
        const startDate = new Date('2024-01-07T10:00:00.000Z')
        const endDate = new Date('2024-01-07T11:00:00.000Z')

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConferences.conference.props.id,
            startDate,
            endDate
        }
        it('should change dates', async () => {
            await usecase.execute(payload)
            const fetchedConference = await conferenceRepository.findById(testConferences.conference.props.id)

            expect(fetchedConference!.props.startDate).toEqual(startDate)
            expect(fetchedConference!.props.endDate).toEqual(endDate)

        })
        it('should send email to participants', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails).toHaveLength(1)
            expect(mailer.sentEmails[0]).toEqual({
                from: 'TEDx Conference',
                to: testUsers.alice.props.email,
                subject: 'Conference dates were updated',
                body: `The conference with title: ${testConferences.conference.props.title} has updated its dates`
            })
        })
    })

    describe('Scenario: change dates of conference not existing', () => {
        const payload = {
            user: testUsers.johnDoe,
            conferenceId: 'non-existing-id',
            startDate: new Date('2024-01-07T10:00:00.000Z'),
            endDate: new Date('2024-01-07T11:00:00.000Z'),
        }
        it('should throw an error', async () => {})
    })

    describe('Scenario: change dates of conference of someone else', () => {
        const payload = {
            user: testUsers.bob,
            conferenceId: testConferences.conference.props.id,
            startDate: new Date('2024-01-07T10:00:00.000Z'),
            endDate: new Date('2024-01-07T11:00:00.000Z'),
        }
        it('should throw an error', async () => {})
    })

    describe('Scenario: the new date is too soon', () => {
        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConferences.conference.props.id,
            startDate: new Date('2024-01-02T10:00:00.000Z'),
            endDate: new Date('2024-01-02T11:00:00.000Z'),
        }
        it('should throw an error', async () => {})
    })

    describe('Scenario: the conference is too long', () => {
        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConferences.conference.props.id,
            startDate: new Date('2024-01-07T10:00:00.000Z'),
            endDate: new Date('2024-01-07T14:00:00.000Z'),
        }
        it('should throw an error', async () => {})
    })
})