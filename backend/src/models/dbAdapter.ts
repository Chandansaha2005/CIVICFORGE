import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_DB_PATH = path.join(process.cwd(), 'local_database.json');

// Initialize local JSON file if it doesn't exist
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({
    users: [],
    grievances: [],
    solutions: [],
    vouches: [],
    projectblueprints: []
  }, null, 2));
}

// Read local DB
function readLocalDB() {
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {
      users: [],
      grievances: [],
      solutions: [],
      vouches: [],
      projectblueprints: []
    };
  }
}

// Write local DB
function writeLocalDB(data: any) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write to local JSON database', e);
  }
}

// Generate a random MongoDB-like ObjectId
export function generateObjectId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function matches(item: any, query: any): boolean {
  for (const key in query) {
    if (query[key] && typeof query[key] === 'object' && !Array.isArray(query[key])) {
      // Handle Mongoose operators like $in, $or, $gte, etc.
      const ops = query[key];
      if ('$in' in ops) {
        const list = ops['$in'];
        const itemVal = item[key];
        const itemStr = (itemVal && typeof itemVal === 'object' && itemVal._id) ? itemVal._id.toString() : (itemVal ? itemVal.toString() : '');
        const hasMatch = list.some((val: any) => {
          const valStr = (val && typeof val === 'object' && val._id) ? val._id.toString() : (val ? val.toString() : '');
          return valStr === itemStr;
        });
        if (!hasMatch) return false;
      } else if ('$gte' in ops) {
        if (item[key] < ops['$gte']) return false;
      } else if ('$lte' in ops) {
        if (item[key] > ops['$lte']) return false;
      }
    } else {
      if (item[key] !== query[key]) return false;
    }
  }
  return true;
}

export function wrapDocument(item: any, collectionName: string) {
  if (!item) return item;
  if (typeof item !== 'object') return item;

  if (typeof item.save === 'function') return item;

  Object.defineProperty(item, 'save', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: async function() {
      const db = readLocalDB();
      const coll = db[collectionName] || [];
      const idx = coll.findIndex((i: any) => i._id === this._id);
      if (idx !== -1) {
        const { ...plainData } = this;
        coll[idx] = plainData;
        db[collectionName] = coll;
        writeLocalDB(db);
      }
      return this;
    }
  });

  return item;
}

class MockQuery {
  private data: any[];
  private currentQuery: any;

  constructor(data: any[], query: any = {}) {
    this.data = data;
    this.currentQuery = query;
  }

  private matches(item: any, query: any): boolean {
    return matches(item, query);
  }

  private filter() {
    let result = [...this.data];
    if (this.currentQuery) {
      result = result.filter(item => this.matches(item, this.currentQuery));
    }
    return result;
  }

  select(fields: string | object) {
    // Mimic Mongoose select (just returns this for chaining)
    return this;
  }

  sort(sortOptions: any) {
    // Simple sort support if needed, e.g. { createdAt: -1 }
    let filtered = this.filter();
    if (typeof sortOptions === 'object') {
      const key = Object.keys(sortOptions)[0];
      const order = sortOptions[key];
      filtered.sort((a, b) => {
        if (a[key] < b[key]) return order === -1 ? 1 : -1;
        if (a[key] > b[key]) return order === -1 ? -1 : 1;
        return 0;
      });
    }
    return new MockQuery(filtered, null);
  }

  populate(path: string | string[]) {
    // Populate simple relationships in our local DB
    const filtered = this.filter();
    const db = readLocalDB();
    
    const populated = filtered.map(item => {
      const cloned = { ...item };
      const paths = Array.isArray(path) ? path : [path];
      
      paths.forEach(p => {
        if (p === 'citizen' && cloned.citizen) {
          cloned.citizen = db.users.find((u: any) => u._id === cloned.citizen || u._id === cloned.citizen?._id) || cloned.citizen;
        } else if (p === 'developer' && cloned.developer) {
          cloned.developer = db.users.find((u: any) => u._id === cloned.developer || u._id === cloned.developer?._id) || cloned.developer;
        } else if (p === 'mp' && cloned.mp) {
          cloned.mp = db.users.find((u: any) => u._id === cloned.mp || u._id === cloned.mp?._id) || cloned.mp;
        } else if (p === 'matchedSolution' && cloned.matchedSolution) {
          cloned.matchedSolution = db.solutions.find((s: any) => s._id === cloned.matchedSolution || s._id === cloned.matchedSolution?._id) || cloned.matchedSolution;
        } else if (p === 'user' && cloned.user) {
          cloned.user = db.users.find((u: any) => u._id === cloned.user || u._id === cloned.user?._id) || cloned.user;
        } else if (p === 'solution' && cloned.solution) {
          cloned.solution = db.solutions.find((s: any) => s._id === cloned.solution || s._id === cloned.solution?._id) || cloned.solution;
        } else if (p === 'grievanceCluster' && Array.isArray(cloned.grievanceCluster)) {
          cloned.grievanceCluster = cloned.grievanceCluster.map((gId: any) => {
            const id = typeof gId === 'string' ? gId : gId?._id;
            return db.grievances.find((g: any) => g._id === id) || gId;
          });
        }
      });
      return cloned;
    });

    return new MockQuery(populated, null);
  }

  async exec() {
    return this.filter();
  }

  // Allow then/catch to act as a Promise directly
  then(onfulfilled?: (value: any[]) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.filter()).then(onfulfilled, onrejected);
  }
}

// Mock Model Class
class MockModel {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName.toLowerCase() + 's';
  }

  private getCollection() {
    const db = readLocalDB();
    const items = db[this.collectionName] || [];
    return items.map((item: any) => wrapDocument(item, this.collectionName));
  }

  private saveCollection(items: any[]) {
    const db = readLocalDB();
    db[this.collectionName] = items;
    writeLocalDB(db);
  }

  find(query: any = {}) {
    return new MockQuery(this.getCollection(), query);
  }

  findOne(query: any = {}) {
    const items = this.getCollection();
    const queryKeys = Object.keys(query);
    const found = items.find((item: any) => {
      return queryKeys.every(key => item[key] === query[key]);
    });
    
    // Return an object that has a populate and select chain
    return {
      select: () => ({
        populate: (p: string) => ({
          exec: async () => {
            const q = new MockQuery([found].filter(Boolean), null);
            const res = await q.populate(p).exec();
            return res[0] || null;
          },
          then: (cb: any) => {
            const q = new MockQuery([found].filter(Boolean), null);
            return q.populate(p).then((res: any) => cb(res[0] || null));
          }
        }),
        exec: async () => found || null,
        then: (cb: any) => cb(found || null)
      }),
      populate: (p: string) => ({
        exec: async () => {
          const q = new MockQuery([found].filter(Boolean), null);
          const res = await q.populate(p).exec();
          return res[0] || null;
        },
        then: (cb: any) => {
          const q = new MockQuery([found].filter(Boolean), null);
          return q.populate(p).then((res: any) => cb(res[0] || null));
        }
      }),
      exec: async () => found || null,
      then: (cb: any) => cb(found || null)
    };
  }

  findById(id: string) {
    return this.findOne({ _id: id });
  }

  async create(data: any) {
    const items = this.getCollection();
    const newItem = {
      _id: generateObjectId(),
      createdAt: new Date().toISOString(),
      ...data
    };
    const wrapped = wrapDocument(newItem, this.collectionName);
    items.push(wrapped);
    this.saveCollection(items);
    return wrapped;
  }

  async findByIdAndUpdate(id: string, update: any, options: any = {}) {
    const items = this.getCollection();
    const index = items.findIndex((item: any) => item._id === id);
    if (index === -1) return null;
    
    const updatedItem = {
      ...items[index],
      ...(update.$set || update)
    };
    const wrapped = wrapDocument(updatedItem, this.collectionName);
    items[index] = wrapped;
    this.saveCollection(items);
    return wrapped;
  }

  async updateOne(query: any, update: any) {
    const items = this.getCollection();
    // find index matching query
    const index = items.findIndex((item: any) => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    if (index === -1) return { nModified: 0 };
    
    items[index] = {
      ...items[index],
      ...(update.$set || update)
    };
    this.saveCollection(items);
    return { nModified: 1 };
  }

  async updateMany(query: any, update: any) {
    const items = this.getCollection();
    const updatePayload = update.$set || update;
    let modifiedCount = 0;

    const updatedItems = items.map((item: any) => {
      if (matches(item, query)) {
        modifiedCount++;
        return {
          ...item,
          ...updatePayload
        };
      }
      return item;
    });

    if (modifiedCount > 0) {
      this.saveCollection(updatedItems);
    }

    return { modifiedCount };
  }

  async countDocuments(query: any = {}) {
    const items = this.getCollection();
    const queryKeys = Object.keys(query);
    if (queryKeys.length === 0) return items.length;
    return items.filter((item: any) => {
      return queryKeys.every(key => item[key] === query[key]);
    }).length;
  }

  async deleteMany(query: any = {}) {
    if (Object.keys(query).length === 0) {
      this.saveCollection([]);
    } else {
      const items = this.getCollection();
      const kept = items.filter((item: any) => {
        return !Object.keys(query).every(key => item[key] === query[key]);
      });
      this.saveCollection(kept);
    }
    return { deletedCount: 1 };
  }
}

// Utility to decide if using real mongoose or our mock database
export function isMongoConfigured(): boolean {
  return !!process.env.MONGO_URI && process.env.MONGO_URI !== '';
}

export function getModelAdapter(modelName: string, schema: mongoose.Schema) {
  if (isMongoConfigured()) {
    try {
      return mongoose.model(modelName);
    } catch (e) {
      return mongoose.model(modelName, schema);
    }
  } else {
    // Create a singleton MockModel instance for this model
    const mockModelInstance = new MockModel(modelName);

    // Return a class with both static methods (for queries) and constructor (for creation)
    class ModelConstructor {
      _id: string | undefined;
      createdAt: string | undefined;
      [key: string]: any;

      constructor(data?: any) {
        if (data) {
          Object.assign(this, data);
          this._id = data._id || generateObjectId();
          this.createdAt = data.createdAt || new Date().toISOString();
        }
      }

      async save() {
        const db = readLocalDB();
        const collectionKey = modelName.toLowerCase() + 's';
        const coll = db[collectionKey] || [];
        
        const idx = coll.findIndex((i: any) => i._id === this._id);
        if (idx !== -1) {
          coll[idx] = { ...this };
        } else {
          coll.push({ ...this });
        }
        db[collectionKey] = coll;
        writeLocalDB(db);
        return this;
      }

      // Static methods that delegate to the MockModel instance
      static find(query: any = {}) {
        return mockModelInstance.find(query);
      }

      static findOne(query: any = {}) {
        return mockModelInstance.findOne(query);
      }

      static findById(id: string) {
        return mockModelInstance.findById(id);
      }

      static async create(data: any) {
        return mockModelInstance.create(data);
      }

      static async findByIdAndUpdate(id: string, update: any, options: any = {}) {
        return mockModelInstance.findByIdAndUpdate(id, update, options);
      }

      static async updateOne(query: any, update: any) {
        return mockModelInstance.updateOne(query, update);
      }

      static async updateMany(query: any, update: any) {
        return mockModelInstance.updateMany(query, update);
      }

      static async countDocuments(query: any = {}) {
        return mockModelInstance.countDocuments(query);
      }

      static async deleteMany(query: any = {}) {
        return mockModelInstance.deleteMany(query);
      }
    }

    return ModelConstructor as any;
  }
}
