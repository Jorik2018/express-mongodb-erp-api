import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends mongoose.Document {
    password: string;
    date: Date;
    loggedOn: boolean;
    verifyPassword(password: string): boolean;
}


const UserSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    loggedOn: {
        type: Boolean,
        required: true,
        default: false
    },
    avatar: {
        type: String
    }
});

UserSchema.methods.verifyPassword = function (password: string) {
    return bcrypt.compareSync(password, this.password);
};

//export default mongoose.model('User2', UserSchema);