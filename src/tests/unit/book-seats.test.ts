import {InMemoryBookingRepository} from "../in-memory/in-memory-booking-repository"
import {InMemoryConferenceRepository} from "../in-memory/in-memory-conference-repository"
import {InMemoryMailer} from "../in-memory/in-memory-mailer"
import {InMemoryUserRepository} from "../in-memory/in-memory-user-repository"
import {testBookings} from "./seeds/seeds-booking"
import {testConferences} from "./seeds/seeds-conference"
import {testUsers} from "./seeds/seeds-user"
import {BookSeats} from "../../usecases/book-seats";

describe('Usecase: Book seats', () => {
    let conferenceRepository: InMemoryConferenceRepository
    let bookingRepository: InMemoryBookingRepository
    let userRepository: InMemoryUserRepository
    let mailer: InMemoryMailer
    let usecase: BookSeats

    beforeEach(async () => {
        conferenceRepository = new InMemoryConferenceRepository()
        await conferenceRepository.create(testConferences.conference)

        bookingRepository = new InMemoryBookingRepository()

        userRepository = new InMemoryUserRepository()
        for (const user of Object.values(testUsers)) {
            await userRepository.create(user)
        }

        mailer = new InMemoryMailer()
        usecase = new BookSeats(conferenceRepository, bookingRepository, mailer, userRepository)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            conferenceId: testConferences.conference.props.id,
            user: testUsers.johnDoe
        }

        it('should book a seat', async () => {
            await usecase.execute(payload)
            const fetchedBooking = await bookingRepository.findByConferenceId(
                testConferences.conference.props.id
            )

            expect(fetchedBooking).toBeDefined()
            expect(fetchedBooking[0]!.props.userId).toEqual(testUsers.johnDoe.props.id)
            expect(fetchedBooking[0]!.props.conferenceId).toEqual(testConferences.conference.props.id)
        })

        it('should send an email', async () => {
            await usecase.execute(payload)
            expect(mailer.sentEmails.length).toEqual(1)
            expect(mailer.sentEmails[0]).toEqual({
                from: 'TEDx Conference',
                to: testUsers.johnDoe.props.email,
                subject: 'You have successfully booked a seat',
                body: `You have successfully booked a seat for the conference: ${testConferences.conference.props.title}`
            })
        })
    })

    describe('Scenario: Conference does not exist', () => {
        const payload = {
            conferenceId: 'non-existing-id',
            user: testUsers.johnDoe
        }

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference not found")
        })
    })

    describe('Scenario: Not enough seats available', () => {
        const payload = {
            conferenceId: testConferences.conference.props.id,
            user: testUsers.johnDoe
        }

        // create 50 bookings to fill all the seats
        beforeEach(async () => {
            for (let i = 0; i < 50; i++) {
                await bookingRepository.create(testBookings.aliceBooking)
            }
        })

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Not enough seats available")
        })
    })
})