import request from 'supertest';
import app from '../../../app';
import { coursesFilePath, readFromFile, writeToFile } from '../../../utils/FileHandlers';

jest.mock('../../../utils/FileHandlers', () => ({
  readFromFile: jest.fn(),
  writeToFile: jest.fn(),
}));

describe('GET /api/courses', () => {
  const mockCourses = [
    { id: 1, title: 'Course 1', description: 'Description 1' },
    { id: 2, title: 'Course 2', description: 'Description 2' },
    { id: 3, title: 'Course 3', description: 'Description 3' },
    { id: 4, title: 'Course 4', description: 'Description 4' },
  ];

  beforeEach(() => {
    (readFromFile as jest.Mock).mockResolvedValue(mockCourses);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated courses with a 200 status code', async () => {
    const page = 1;
    const limit = 2;

    const response = await request(app)
      .get('/api/courses')
      .query({ page, limit });

    expect(readFromFile).toHaveBeenCalledWith(coursesFilePath);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      page,
      limit,
      totalCourses: mockCourses.length,
      courses: mockCourses.slice(0, limit),
    });
  });

  it('should return a 404 status code when no courses are available', async () => {
    (readFromFile as jest.Mock).mockResolvedValue([]);

    const response = await request(app).get('/api/courses');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Course not found.' });
  });

  it('should return courses based on custom page and limit query parameters', async () => {
    const page = 2;
    const limit = 2;

    const response = await request(app)
      .get('/api/courses')
      .query({ page, limit });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      page,
      limit,
      totalCourses: mockCourses.length,
      courses: mockCourses.slice(startIndex, endIndex),
    });
  });

  it('should return a 500 status code if an error occurs', async () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(app).get('/api/courses');

    expect(response.status).toBe(500);
    expect(response.body).toEqual("Internal Server Error.");
  });
});
