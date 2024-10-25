import { Model } from "mongoose";
import { Booking } from "../../../domain/entities/booking.entity";
import { IBookingRepository } from "../../../interfaces/booking-repository.interface";
import { MongoBooking } from "./mongo-booking";
import { randomUUID } from "crypto";

class BookingMapper {
    static toCore(document: MongoBooking.BookingDocument): Booking {
        return new Booking({
            conferenceId: document.conferenceId,
            userId: document.userId
        })
    }

    static toPersistence(booking: Booking): MongoBooking.BookingDocument {
        return new MongoBooking.BookingModel({
            _id: randomUUID(),
            conferenceId: booking.props.conferenceId,
            userId: booking.props.userId
        })
    }
}

export class MongoBookingRepository implements IBookingRepository {
    constructor(
        private readonly model: Model<MongoBooking.BookingDocument>
    ) {}

    async create(booking: Booking): Promise<void> {
        await BookingMapper.toPersistence(booking).save()
    }

    async findByConferenceId(conferenceId: string): Promise<Booking[]> {
        const documents = await this.model.find({ conferenceId })
        return documents.map(doc => BookingMapper.toCore(doc))
    }
}