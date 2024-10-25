import { OrganizeConference } from "../../usecases/organize-conference"
import { FixedDateGenerator } from "../fixed/fixed-date-generator"
import { FixedIDGenerator } from "../fixed/fixed-id-generator"
import { InMemoryConferenceRepository } from "../in-memory/in-memory-conference-repository"
import { testUsers } from "./seeds/seeds-user"
import {InMemoryPublisher} from "../../tests/in-memory/in-memory-publisher";
import {testConferences} from "../../tests/unit/seeds/seeds-conference";

describe('Usecase: Organize a conference', () => {
    let repository: InMemoryConferenceRepository
    let idGenerator: FixedIDGenerator
    let dateGenerator: FixedDateGenerator
    let usecase: OrganizeConference
    let messageBroker: InMemoryPublisher

    beforeEach(() => {
        repository = new InMemoryConferenceRepository()
        idGenerator = new FixedIDGenerator()
        dateGenerator = new FixedDateGenerator()
        messageBroker = new InMemoryPublisher()
        usecase = new OrganizeConference(repository, idGenerator, dateGenerator, messageBroker)
    })


    describe('Scenario: Happy path', () => {
        const payload = {
            user: testUsers.johnDoe,
            title: "Nouvelle conference",
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T11:00:00.000Z'),
            seats: 50
        }

        it('should return id', async () => {
            const result = await usecase.execute(payload)
            expect(result.id).toEqual('id-1')
        })
        
        it('should insert conference in db', async () => {
            await usecase.execute(payload)
            const fetchedConference = repository.database[0]
            expect(repository.database).toHaveLength(1)
            expect(fetchedConference.props.title).toEqual('Nouvelle conference')
        })

        it ('should publish a message', async () => {
            await usecase.execute(payload)
            const messages = messageBroker.getMessages('conference-organized')
            expect(messages).toHaveLength(1)
            expect(messages[0]).toEqual({
                conferenceId: expect.any(String),
                organizerEmail: testUsers.johnDoe.props.email,
                title: testConferences.conference.props.title,
                seats: testConferences.conference.props.seats
            })
        })
    })

    describe('Scenario: Conference happens too soon', () => {
        const payload = {
            user: testUsers.johnDoe,
            title: "Nouvelle conference",
            startDate: new Date('2024-01-02T10:00:00.000Z'),
            endDate: new Date('2024-01-02T11:00:00.000Z'),
            seats: 50
        }

        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference must happen in at least 3 days")
        })

        it('should not create a conference', async () => {
            try {
                await usecase.execute(payload)
            } catch (error) {}

            expect(repository.database).toHaveLength(0)
        })
    })

    describe('Scenario: Conference has not enough seats', () => {
        const payload = {
            user: testUsers.johnDoe,
            title: "Nouvelle conference",
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T11:00:00.000Z'),
            seats: 15
        }
        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('Conference has not enough seats')
        })
    })

    describe('Scenario: Conference has too many seats', () => {
        const payload = {
            user: testUsers.johnDoe,
            title: "Nouvelle conference",
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T11:00:00.000Z'),
            seats: 1001
        }
        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('Conference has too many seats')
        })
    })

    describe('Scenario: Conference is too long', () => {
        const payload = {
            user: testUsers.johnDoe,
            title: "Nouvelle conference",
            startDate: new Date('2024-01-04T10:00:00.000Z'),
            endDate: new Date('2024-01-04T14:00:00.000Z'),
            seats: 50
        }
        it('should throw an error', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('Conference is too long (> 3 hours)')
        })
    })
})