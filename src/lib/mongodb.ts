"use client";

import axios from 'axios';

// These should be provided by the user in their MongoDB Atlas dashboard
// Go to Atlas -> Data API to enable and get these credentials
const MONGODB_DATA_API_KEY = "YOUR_MONGODB_DATA_API_KEY";
const MONGODB_APP_ID = "YOUR_APP_ID"; 
const MONGODB_CLUSTER = "Cluster0";
const MONGODB_DATABASE = "ledger_db";
const MONGODB_COLLECTION = "entries";

const baseURL = `https://data.mongodb-api.com/app/${MONGODB_APP_ID}/endpoint/data/v1/action`;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Request-Headers': '*',
  'api-key': MONGODB_DATA_API_KEY,
};

const dataSource = {
  collection: MONGODB_COLLECTION,
  database: MONGODB_DATABASE,
  dataSource: MONGODB_CLUSTER,
};

export const mongoClient = {
  async find(filter = {}) {
    const response = await axios.post(`${baseURL}/find`, {
      ...dataSource,
      filter,
      sort: { created_at: -1 }
    }, { headers });
    return response.data.documents;
  },

  async insertOne(document: any) {
    const response = await axios.post(`${baseURL}/insertOne`, {
      ...dataSource,
      document: {
        ...document,
        created_at: new Date().toISOString()
      }
    }, { headers });
    return response.data.insertedId;
  },

  async deleteOne(id: string) {
    const response = await axios.post(`${baseURL}/deleteOne`, {
      ...dataSource,
      filter: { _id: { "$oid": id } }
    }, { headers });
    return response.data.deletedCount;
  }
};

export const isMongoConfigured = () => {
  return MONGODB_DATA_API_KEY !== "YOUR_MONGODB_DATA_API_KEY" && MONGODB_APP_ID !== "YOUR_APP_ID";
};