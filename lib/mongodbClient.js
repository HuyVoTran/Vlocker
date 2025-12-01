// lib/mongodbClient.js

import { MongoClient } from 'mongodb';

// Lấy URI từ biến môi trường
const uri = process.env.MONGODB_URI; 
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

// Trong môi trường development, sử dụng biến global để cache client
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) { // Tên biến cache được giữ để đồng nhất với đoạn TS bạn dùng
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Trong môi trường production, tạo client mới
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Xuất ra clientPromise
export default clientPromise;