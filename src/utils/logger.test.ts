import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger, LogLevel } from '../utils/logger.js';

describe('Logger', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    logger.setLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    consoleErrorSpy.mockRestore();
  });

  describe('debug', () => {
    it('should log when level is DEBUG', () => {
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('Test message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[DEBUG]', 'Test message');
    });

    it('should not log when level is INFO', () => {
      logger.setLevel(LogLevel.INFO);
      logger.debug('Test message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log when level is INFO', () => {
      logger.setLevel(LogLevel.INFO);
      logger.info('Test message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[INFO]', 'Test message');
    });

    it('should not log when level is WARN', () => {
      logger.setLevel(LogLevel.WARN);
      logger.info('Test message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log when level is WARN', () => {
      logger.setLevel(LogLevel.WARN);
      logger.warn('Test message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[WARN]', 'Test message');
    });

    it('should not log when level is ERROR', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.warn('Test message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log when level is ERROR', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.error('Test message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test message');
    });

    it('should not log when level is SILENT', () => {
      logger.setLevel(LogLevel.SILENT);
      logger.error('Test message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('setLevel', () => {
    it('should change logging level', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.info('Should not log');
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      logger.error('Should log');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Should log');
    });
  });
});
