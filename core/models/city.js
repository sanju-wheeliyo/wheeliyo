import mongoose from 'mongoose'

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
})

citySchema.index({ location: '2dsphere' })

export default mongoose?.models?.City || mongoose.model('City', citySchema)
