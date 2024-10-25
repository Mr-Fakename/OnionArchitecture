import {Application} from 'express'
import request from 'supertest'
import {container} from '../../infrastructure/config/dependency-injection'
import {testConferences} from '../unit/seeds/seeds-conference'
import {e2eConferences} from './seeds/conference-e2e-seed'
import {e2eUsers} from './seeds/user-e2e-seed'
import {TestApp} from './utils/test-app'

describe('Usecase: Book Conference', () => {
    const conferenceRepository = container('conferenceRepository')
    const bookingRepository = container('bookingRepository')
    const mailer = container('mailer')

    let testApp: TestApp
    let app: Application
    let authToken: string

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        await testApp.loadFixtures([
            e2eConferences.conference,
            e2eUsers.johnDoe,
            e2eUsers.alice
        ])
        app = testApp.expressApp

        // Generate JWT token for the test user
        authToken = await testApp.generateAuthToken(e2eUsers.alice)
    })

    afterAll(async () => {
        await testApp.tearDown()
    })

    it('should create a booking', async () => {
        const response = await request(app)
            .post(`/conference/${testConferences.conference.props.id}/book`)
            .set('Authorization', authToken)
            .send({
                conferenceId: testConferences.conference.props.id,
            })

        expect(response.status).toEqual(201)

        const fetchedConference = await conferenceRepository.findById(testConferences.conference.props.id)
        const fetchedBooking = await bookingRepository.findByConferenceId(testConferences.conference.props.id)

        expect(fetchedConference).toBeDefined()
        expect(fetchedBooking).toBeDefined()
        expect(fetchedBooking![0].props.userId).toEqual(e2eUsers.alice.entity.props.id)

        expect(mailer.sentEmails).toHaveLength(1)
    })
})