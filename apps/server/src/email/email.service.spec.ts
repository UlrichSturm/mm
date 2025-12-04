import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EmailService } from './email.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EmailService', () => {
  let service: EmailService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        APP_URL: 'http://localhost:3000',
        MAILGUN_DOMAIN: 'test.mailgun.org',
        MAILGUN_API_KEY: 'test-api-key',
        EMAIL_FROM: 'test@example.com',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email successfully via Mailgun API', async () => {
      // Arrange
      const options = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        template: 'welcome',
        context: { firstName: 'John' },
      };

      const mockResponse = {
        data: {
          id: 'test-email-id',
          message: 'Queued. Thank you.',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      await service.sendEmail(options);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/messages'),
        expect.any(URLSearchParams),
        expect.objectContaining({
          auth: {
            username: 'api',
            password: 'test-api-key',
          },
        }),
      );
    });

    it('should handle email sending errors gracefully', async () => {
      // Arrange
      const options = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        template: 'welcome',
        context: { firstName: 'John' },
      };

      const error = new Error('Request failed');
      mockedAxios.post.mockRejectedValue(error);

      // Act
      await service.sendEmail(options);

      // Assert - should not throw, just log error
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should not send email when MAILGUN_API_KEY is not configured', async () => {
      // Arrange
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'MAILGUN_API_KEY') return undefined;
        return 'test-value';
      });

      // Recreate service with new config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithoutKey = module.get<EmailService>(EmailService);

      const options = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        template: 'welcome',
        context: { firstName: 'John' },
      };

      // Act
      await serviceWithoutKey.sendEmail(options);

      // Assert - should not call axios
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should call sendEmail with welcome template', async () => {
      // Arrange
      const to = 'newuser@example.com';
      const firstName = 'John';

      const mockResponse = {
        data: {
          id: 'welcome-email-id',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Spy on sendEmail method
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      // Act
      await service.sendWelcomeEmail(to, firstName);

      // Assert
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Welcome to Memento Mori',
          template: 'welcome',
          context: { firstName },
        }),
      );
    });
  });
});

