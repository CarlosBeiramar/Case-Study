import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';

jest.mock("../../../utils/FileHandlers");

describe("GET /api/courses/:courseId/modules", () => {
  const sampleCourse = {
    id: 1,
    title: "Sample Course",
    modules: [
      { id: 1, title: "Module 1" },
      { id: 2, title: "Module 2" },
      { id: 3, title: "Module 3" },
    ],
  };

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
  });

  it("should retrieve paginated course modules with a 200 status", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([sampleCourse]);

    const response = await request(app)
      .get("/api/courses/1/modules")
      .query({ page: 1, limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      page: 1,
      limit: 2,
      totalModules: sampleCourse.modules.length,
      modules: sampleCourse.modules.slice(0, 2),
    });
  });

  it("should return a 404 status if the course is not found", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get("/api/courses/99/modules");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course or modules not found." });
  });

  it("should return a 404 status if the course has no modules", async () => {
    const courseWithNoModules = { ...sampleCourse, modules: [] };
    (readFromFile as jest.Mock).mockResolvedValueOnce([courseWithNoModules]);

    const response = await request(app).get("/api/courses/1/modules");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course or modules not found." });
  });

  it("should return a 500 status if there is an error reading the file", async () => {
    (readFromFile as jest.Mock).mockRejectedValue(new Error("File read error"));

    const response = await request(app).get("/api/courses/1/modules");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error." });
  });
});
