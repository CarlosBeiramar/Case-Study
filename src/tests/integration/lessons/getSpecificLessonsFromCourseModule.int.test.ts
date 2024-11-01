import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';

jest.mock("../../../utils/FileHandlers");

describe("GET /api/courses/:courseId/modules/:moduleId/lessons/:lessonId", () => {
  const sampleCourse = {
    id: 1,
    title: "Sample Course",
    description: "Sample description",
    modules: [
      {
        id: 1,
        title: "Sample Module",
        lessons: [
          { id: 1, title: "Lesson 1", description: "Lesson 1 description" },
          { id: 2, title: "Lesson 2", description: "Lesson 2 description" },
        ],
      },
    ],
  };

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
    (writeToFile as jest.Mock).mockReset();
  });

  it("should return a specific lesson successfully with a 200 status", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([sampleCourse]);

    const response = await request(app).get("/api/courses/1/modules/1/lessons/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, title: "Lesson 1", description: "Lesson 1 description" });
  });

  it("should return a 404 status if the course or modules are not found", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get("/api/courses/1/modules/1/lessons/1");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course or modules not found" });
  });

  it("should return a 404 status if the module or lessons are not found", async () => {
    const courseWithoutLessons = {
      id: 1,
      title: "Sample Course",
      description: "Course description",
      modules: [{ id: 2, title: "Another Module", lessons: [] }],
    };

    (readFromFile as jest.Mock).mockResolvedValueOnce([courseWithoutLessons]);

    const response = await request(app).get("/api/courses/1/modules/1/lessons/1");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Modules or lessons not found." });
  });

  it("should return a 500 status if there is an error reading the file", async () => {
    (readFromFile as jest.Mock).mockRejectedValue(new Error("File read error"));

    const response = await request(app).get("/api/courses/1/modules/1/lessons/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error" });
  });
});
