import { connect } from "http2";

const mongoose = require('mongoose');

// Connection String
const uri = 'mongodb://localhost:27017/myDatabase';

// Connecting MongoDB using Mongoose
async function connectToDatabase() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase;