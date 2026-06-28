import { Document } from 'mongoose';
export declare class ReviewDocument extends Document {
    userId: string;
    restaurantId: string;
    orderId: string;
    rating: number;
    comment: string;
    images: string[];
}
export declare const ReviewSchema: import("mongoose").Schema<ReviewDocument, import("mongoose").Model<ReviewDocument, any, any, any, any, any, ReviewDocument>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReviewDocument, Document<unknown, {}, ReviewDocument, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<string, ReviewDocument, Document<unknown, {}, ReviewDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, ReviewDocument, Document<unknown, {}, ReviewDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    orderId?: import("mongoose").SchemaDefinitionProperty<string, ReviewDocument, Document<unknown, {}, ReviewDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rating?: import("mongoose").SchemaDefinitionProperty<number, ReviewDocument, Document<unknown, {}, ReviewDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, ReviewDocument, Document<unknown, {}, ReviewDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    comment?: import("mongoose").SchemaDefinitionProperty<string, ReviewDocument, Document<unknown, {}, ReviewDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    images?: import("mongoose").SchemaDefinitionProperty<string[], ReviewDocument, Document<unknown, {}, ReviewDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ReviewDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ReviewDocument>;
