
import { addDays, addHours } from 'date-fns'
import { Application } from 'express'
import request from 'supertest'
import { e2eUsers } from './seeds/user-e2e-seed'
import { TestApp } from './utils/test-app'

describe('Usecase: Organize Conference', () => {
    let testApp: TestApp
    let app: Application

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        await testApp.loadFixtures([e2eUsers.johnDoe])
        app = testApp.expressApp
    })

    afterAll(async() => {
        testApp.tearDown()
    })

    it('should organize a conference', async () => {
        const response = await request(app)
                                .post('/conference')
                                .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
                                .send({
                                    title: "Ma nouvelle conference",
                                    seats: 100,
                                    startDate: addDays(new Date(), 4).toISOString(),
                                    endDate: addDays(addHours(new Date(), 2), 4).toISOString()
                                })

        expect(response.status).toEqual(201)
        expect(response.body.data).toEqual({id: expect.any(String)})
    })
})