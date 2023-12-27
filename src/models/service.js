import mongoose from '../models/index.js';

const serviceModel = new mongoose.Schema({
  brand:{ type: String, required: [true, "Brand is required"] },
  model:{ type: String, required: [true, "Model is required"] },
  manufactureyear:{ type: Number, required: [true, "Manufacturing year is required"] },
  servicetype: { type: String, required: [true, "Service type is required"] },
  Date:{type:Date, default: Date.now()},
  comments:{ type: String }
},
{
  versionKey: false,
}
);

const service = mongoose.model('Service', serviceModel);

export default service;
