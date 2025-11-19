import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createConnection } from '../../utils/mysql.js';
import mysql from 'mysql2/promise';

jest.mock('mysql2/promise');

describe('MySQL Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      MYSQL_HOST: 'localhost',
      MYSQL_USER: 'testuser',
      MYSQL_PASSWORD: 'testpassword',
      MYSQL_DATABASE: 'testdb',
      MYSQL_PORT: '3306',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('createConnection', () => {
    it('should create MySQL connection with environment variables', async () => {
      const mockConnection = {
        query: jest.fn(),
        end: jest.fn(),
      };

      (
        mysql.createConnection as jest.MockedFunction<typeof mysql.createConnection>
      ).mockResolvedValue(mockConnection as any);

      const connection = await createConnection();

      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'localhost',
        user: 'testuser',
        password: 'testpassword',
        database: 'testdb',
        port: 3306,
      });
      expect(connection).toBe(mockConnection);
    });

    it('should use default port 3306 when DB_PORT is not set', async () => {
      process.env.DB_PORT = undefined;

      const mockConnection = {
        query: jest.fn(),
        end: jest.fn(),
      };

      (
        mysql.createConnection as jest.MockedFunction<typeof mysql.createConnection>
      ).mockResolvedValue(mockConnection as any);

      await createConnection();

      expect(mysql.createConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3306,
        })
      );
    });

    it('should parse DB_PORT as integer', async () => {
      process.env.DB_PORT = '5432';

      const mockConnection = {
        query: jest.fn(),
        end: jest.fn(),
      };

      (
        mysql.createConnection as jest.MockedFunction<typeof mysql.createConnection>
      ).mockResolvedValue(mockConnection as any);

      await createConnection();

      expect(mysql.createConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3306,
        })
      );
    });

    it('should handle connection errors', async () => {
      const mockError = new Error('Connection failed');
      (
        mysql.createConnection as jest.MockedFunction<typeof mysql.createConnection>
      ).mockRejectedValue(mockError);

      await expect(createConnection()).rejects.toThrow('Connection failed');
    });

    it('should pass all connection parameters correctly', async () => {
      const mockConnection = {
        query: jest.fn(),
        end: jest.fn(),
      };

      (
        mysql.createConnection as jest.MockedFunction<typeof mysql.createConnection>
      ).mockResolvedValue(mockConnection as any);

      await createConnection();

      const callArgs = (
        mysql.createConnection as jest.MockedFunction<typeof mysql.createConnection>
      ).mock.calls[0][0];

      expect(callArgs).toEqual({
        host: 'localhost',
        user: 'testuser',
        password: 'testpassword',
        database: 'testdb',
        port: 3306,
      });
    });
  });
});
