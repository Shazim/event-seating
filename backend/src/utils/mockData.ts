import { User } from '../types/user';

export const mockUsers: Record<number, User> = {
  1: { id: 1, name: "John Doe", email: "john@example.com" },
  2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
  3: { id: 3, name: "Alice Johnson", email: "alice@example.com" },
  4: { id: 4, name: "Bob Wilson", email: "bob@example.com" },
  5: { id: 5, name: "Carol Brown", email: "carol@example.com" },
};

let nextUserId = Math.max(...Object.keys(mockUsers).map(Number)) + 1;

export const addUser = (name: string, email: string): User => {
  const newUser: User = {
    id: nextUserId++,
    name,
    email,
  };
  
  mockUsers[newUser.id] = newUser;
  return newUser;
};

export const getUserById = (id: number): User | undefined => {
  return mockUsers[id];
};

export const getAllUsers = (): User[] => {
  return Object.values(mockUsers);
};

// Simulate database delay
export const simulateDbDelay = (ms: number = 200): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
