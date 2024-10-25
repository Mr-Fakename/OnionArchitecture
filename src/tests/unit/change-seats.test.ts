import { ChangeSeats } from "../../usecases/change-seats"
import { InMemoryConferenceRepository } from "../in-memory/in-memory-conference-repository"
import { testConferences } from "./seeds/seeds-conference"
import { testUsers } from "./seeds/seeds-user"
import { testBookings } from "./seeds/seeds-booking"
import {InMemoryBookingRepository} from "../../tests/in-memory/in-memory-booking-repository";

describe('Usecase: Change seats', () => {
    let usecase: ChangeSeats
    let conferenceRepository: InMemoryConferenceRepository
    let bookingRepository: InMemoryBookingRepository

    beforeEach(async () => {
        conferenceRepository = new InMemoryConferenceRepository()
        bookingRepository = new InMemoryBookingRepository()
        for (const booking of Object.values(testBookings)) {
            await bookingRepository.create(booking)
        }
        await conferenceRepository.create(testConferences.conference)

        usecase = new ChangeSeats(conferenceRepository, bookingRepository)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            seats: 100,
            conferenceId: testConferences.conference.props.id,
            user: testUsers.johnDoe
        }

        it('should change the number of seats', async () => {
            await usecase.execute(payload)

            const fetchedConference = await conferenceRepository.findById(testConferences.conference.props.id)

            expect(fetchedConference).toBeDefined()
            expect(fetchedConference!.props.seats).toEqual(100)
        })
    })
    
    describe('Scenario: Conference does not exist', () => {
        const payload = {
            seats: 100,
            conferenceId: 'non-existing-id',
            user: testUsers.johnDoe
        }

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference not found")
        })
    })

    describe('Scenario: Conference has too many seats', () => {
        const payload = {
            seats: 1001,
            conferenceId: testConferences.conference.props.id,
            user: testUsers.johnDoe
        }

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference has too many seats")
        })
    })

    describe('Scenario: Conference has not enough seats', () => {
        const payload = {
            seats: 15,
            conferenceId: testConferences.conference.props.id,
            user: testUsers.johnDoe
        }

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference has not enough seats")
        })
    })

    describe("Scenario: New number of seats is inferior to the number of attendees", () => {
        const payload = {
            seats: 1,
            conferenceId: testConferences.conference.props.id,
            user: testUsers.johnDoe
        }

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow(
                "Number of seats cannot be inferior to the number of attendees"
            )
        })
    })

    describe('Scenario: Change conference seats of someone else', () => {
        const payload = {
            seats: 100,
            conferenceId: testConferences.conference.props.id,
            user: testUsers.bob
        }

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("You are not allowed to change this conference")
        })
    })
})