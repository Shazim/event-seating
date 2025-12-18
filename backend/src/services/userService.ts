import { User, CreateUserRequest } from '../types/user';
import { getUserById, addUser, getAllUsers, simulateDbDelay } from '../utils/mockData';
import { LRUCache } from './cacheService';

export class UserService {
  private cache: LRUCache<User>;
  private pendingRequests: Map<string, Promise<User | null>>;

  constructor(cache: LRUCache<User>) {
    this.cache = cache;
    this.pendingRequests = new Map();
  }

  async getUserById(id: number): Promise<User | null> {
    const cacheKey = `user:${id}`;
    
    // Check cache first
    const cachedUser = this.cache.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    // Check if there's already a pending request for this user
    const existingRequest = this.pendingRequests.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request
    const userRequest = this.fetchUserFromDatabase(id);
    this.pendingRequests.set(cacheKey, userRequest);

    try {
      const user = await userRequest;
      
      // Cache the result (even if null/undefined)
      if (user) {
        this.cache.set(cacheKey, user);
      }
      
      return user;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Simulate database delay
    await simulateDbDelay(200);

    // Validate email uniqueness (simple check for demo)
    const existingUsers = getAllUsers();
    const emailExists = existingUsers.some(user => user.email === userData.email);
    
    if (emailExists) {
      throw new Error('User with this email already exists');
    }

    const newUser = addUser(userData.name, userData.email);
    
    // Cache the new user
    const cacheKey = `user:${newUser.id}`;
    this.cache.set(cacheKey, newUser);

    return newUser;
  }

  private async fetchUserFromDatabase(id: number): Promise<User | null> {
    // Simulate database delay
    await simulateDbDelay(200);
    
    const user = getUserById(id);
    return user || null;
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    this.cache.clear();
  }
}
