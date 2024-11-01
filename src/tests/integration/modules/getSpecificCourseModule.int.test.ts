
import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';


jest.mock("../../../utils/FileHandlers");

describe("GET /api/courses/:courseId/modules/:moduleId", () => {
  const sampleCourse = {
    id: 1,
    title: "Sample Course",
    modules: [
      { id: 1, title: "Module 1", lessons: ["Lesson 1", "Lesson 2"] },
      { id: 2, title: "Module 2", lessons: ["Lesson 3"] },
    ],
  };

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
  });

  it("should retrieve a specific module from a course with a 200 status", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([sampleCourse]);

    const response = await request(app).get("/api/courses/1/modules/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(sampleCourse.modules[0]);
  });

  it("should return a 404 status if the course is not found", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get("/api/courses/99/modules/1");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course or modules not found." });
  });

  it("should return a 404 status if the course has no modules", async () => {
    const courseWithNoModules = { ...sampleCourse, modules: [] };
    (readFromFile as jest.Mock).mockResolvedValueOnce([courseWithNoModules]);

    const response = await request(app).get("/api/courses/1/modules/1");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course or modules not found." });
  });

  it("should return a 404 status if the module is not found in the course", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([sampleCourse]);

    const response = await request(app).get("/api/courses/1/modules/99");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Module not found." });
  });

  it("should return a 500 status if there is an error reading the file", async () => {
    (readFromFile as jest.Mock).mockRejectedValue(new Error("File read error"));

    const response = await request(app).get("/api/courses/1/modules/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error." });
  });
});
