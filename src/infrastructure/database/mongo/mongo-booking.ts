import mongoose, {Document, Schema} from "mongoose";

export namespace MongoBooking {
    export const CollectionName = 'bookings'

    export interface BookingDocument extends Document {
        _id: string
        conferenceId: string
        userId: string
    }

    export const BookingSchema = new Schema<BookingDocument>({
        _id: {type: String, required: true},
        conferenceId: {type: String, required: true},
        userId: {type: String, required: true}
    })

    export const BookingModel = mongoose.model<BookingDocument>(CollectionName, BookingSchema)
}