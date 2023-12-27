import mongoose from '../models/index.js';



const validateEmail = (e) => {
  var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(e);
};

const validatePhone = (e) =>{
    var phonenumberPattern = /^\d{10}$/;
    return phonenumberPattern.test(e);
}


const userschema = new mongoose.Schema(
  {
   
    name: { type: String, required: [true, "Name is required"] },
    email: {type: String,  required: [true, "Email is required"],  validate: validateEmail,  },
    phonenumber: {type: Number,  required: [true, "Phone Number is required"],  validate: validatePhone,  },
    password: {type:String,required: [true,"Password is required"]},
    role: { type: String, default: "user" },
    status:{type:Boolean,default:true},
    action:{type:Boolean,default:true},
    serviceHistory: [{type:mongoose.Schema.Types.Array,ref:"service"}], 
    service: [{type:mongoose.Schema.Types.Array,ref:"service"}], 
    serviceEngineer:{type:mongoose.Schema.Types.ObjectId,ref:"engineer"}
  },
  {
    timestamps: true,
  },
  {
    versionKey: false,
  });

const userModel = mongoose.model("user", userschema);
export default userModel;
