import mongoose from 'mongoose';

export const connectToDatabase = async () => {
    if (process.env.NODE_ENV === 'test') {
      console.log('Skipping database connection in test environment');
      return;
    }
  
    const mongoURI = process.env.MONGO_URI as string | undefined;
  
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
  
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB successfully connected');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err instanceof Error ? err.message : err);
      throw err;
    }
  };
  
