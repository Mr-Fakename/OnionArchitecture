import { Model } from "mongoose"
import { MongoBooking } from "../../infrastructure/database/mongo/mongo-booking"
import { MongoBookingRepository } from "../../infrastructure/database/mongo/mongo-booking-repository"
import { TestApp } from "../e2e/utils/test-app"
import { testBookings } from "../unit/seeds/seeds-booking"
import { randomUUID } from "crypto"

describe('MongoBookingRepository Integration', () => {
    let app: TestApp
    let model: Model<MongoBooking.BookingDocument>
    let repository: MongoBookingRepository

    beforeEach(async () => {
        app = new TestApp()
        await app.setup()

        model = MongoBooking.BookingModel
        await model.deleteMany({})
        repository = new MongoBookingRepository(model)

        const record = new model({
            _id: randomUUID(),
            conferenceId: testBookings.aliceBooking.props.conferenceId,
            userId: testBookings.aliceBooking.props.userId
        })

        await record.save()
    })

    afterAll(async () => {
        await app.tearDown()
    })

    describe('findByConferenceId', () => {
        it('should return bookings for a given conference', async () => {
            const bookings = await repository.findByConferenceId(testBookings.aliceBooking.props.conferenceId)
            expect(bookings).toHaveLength(1)
            expect(bookings[0].props).toEqual(testBookings.aliceBooking.props)
        })

        it('should return empty array if no bookings exist', async () => {
            const bookings = await repository.findByConferenceId('non-existing-conference')
            expect(bookings).toHaveLength(0)
        })

        it('should return multiple bookings for same conference', async () => {
            await repository.create(testBookings.bobBooking)

            const bookings = await repository.findByConferenceId(testBookings.aliceBooking.props.conferenceId)
            expect(bookings).toHaveLength(2)
            expect(bookings.map(b => b.props)).toEqual(
                expect.arrayContaining([
                    testBookings.aliceBooking.props,
                    testBookings.bobBooking.props
                ])
            )
        })
    })

    describe('create', () => {
        it('should insert a booking in the collection', async () => {
            await repository.create(testBookings.bobBooking)

            const foundBooking = await model.findOne({
                conferenceId: testBookings.bobBooking.props.conferenceId,
                userId: testBookings.bobBooking.props.userId
            })

            expect(foundBooking!.toObject()).toMatchObject({
                conferenceId: testBookings.bobBooking.props.conferenceId,
                userId: testBookings.bobBooking.props.userId
            })
        })
    })
})