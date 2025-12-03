import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const deleteAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Eliminar todos los usuarios
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`${result.deletedCount} usuarios eliminados`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteAdmin();
