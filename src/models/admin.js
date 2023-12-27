import mongoose from '../models/index.js';

const validateEmail = (e) => {
  var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(e);
};

const validatePhone = (e) =>{
    var phonenumberPattern = /^\d{10}$/;
    return phonenumberPattern.test(e);
}


const adminschema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {type: String,  required: [true, "Email is required"],  validate: validateEmail,  },
    phonenumber: {type: Number,  required: [true, "Phone Number is required"],  validate: validatePhone,  },
    password: {type:String,required: [true,"Password is required"]},
    role: { type: String, default: "admin" },
    resetToken: [String],
    completedReq:[{
      type:mongoose.Schema.Types.Array
    }]
  },
  {
    timestamps: true,
  },
  {
    versionKey: false,
  }
);

const adminModel = mongoose.model("admin", adminschema);
export default adminModel;