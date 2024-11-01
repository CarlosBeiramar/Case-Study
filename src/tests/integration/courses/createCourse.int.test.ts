import request from 'supertest';
import app from '../../../app';
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';

jest.mock("../../../utils/FileHandlers");

describe("POST /api/courses", () => {
  const mockCourse = {
    title: "New Course",
    description: "Description for the new course",
    modules: [
      {
        title: "Module 1",
        lessons: [{ title: "Lesson 1", description: "new lesson", topics: [], content: [] }],
      },
    ],
  };

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
    (writeToFile as jest.Mock).mockReset();
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new course successfully and return a 201 status", async () => {
    const response = await request(app)
      .post("/api/courses")
      .send(mockCourse);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      newCourse: {
        id: 1,
        title: "New Course",
        description: "Description for the new course",
        modules: expect.arrayContaining([expect.objectContaining({ title: "Module 1" })]),
      },
    });

    expect(writeToFile).toHaveBeenCalledWith(coursesFilePath, expect.anything());
    expect(writeToFile).toHaveBeenCalledWith(moduleFilePath, expect.anything());
    expect(writeToFile).toHaveBeenCalledWith(lessonsFilePath, expect.anything());
  });

  it("should return a 500 status if there is an error writing to file", async () => {
    (writeToFile as jest.Mock).mockImplementation(() => {
      throw new Error("File write error");
    });

    const response = await request(app)
      .post("/api/courses")
      .send(mockCourse);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error." });
  });
});
