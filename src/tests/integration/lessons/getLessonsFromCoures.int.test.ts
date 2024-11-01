import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';


jest.mock("../../../utils/FileHandlers");

describe("GET /api/courses/:courseId/modules/:moduleId/lessons", () => {
  const existingCourse = {
    id: 1,
    title: "Existing Course",
    description: "Existing description",
    modules: [
      {
        id: 1,
        title: "Existing Module",
        lessons: [
          { id: 1, title: "Lesson 1", description: "Lesson 1 description" },
          { id: 2, title: "Lesson 2", description: "Lesson 2 description" },
          { id: 3, title: "Lesson 3", description: "Lesson 3 description" },
        ],
      },
    ],
  };

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
    (readFromFile as jest.Mock).mockResolvedValue([existingCourse]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated lessons with a 200 status", async () => {
    const response = await request(app)
      .get("/api/courses/1/modules/1/lessons")
      .query({ page: 1, limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      page: 1,
      limit: 2,
      totalLessons: 3,
      paginatedModuleLessons: [
        { id: 1, title: "Lesson 1", description: "Lesson 1 description" },
        { id: 2, title: "Lesson 2", description: "Lesson 2 description" },
      ],
    });
  });

  it("should return a 404 status if the course or modules are not found", async () => {
    (readFromFile as jest.Mock).mockResolvedValue([]);

    const response = await request(app).get("/api/courses/999/modules/1/lessons");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course or modules not found" });
  });

  it("should return a 404 status if the module or lessons are not found", async () => {
    (readFromFile as jest.Mock).mockResolvedValue([
      { ...existingCourse, modules: [{ id: 2, title: "Empty Module", lessons: [] }] },
    ]);

    const response = await request(app).get("/api/courses/1/modules/2/lessons");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Modules or lessons not found." });
  });

  it("should return a 500 status if there is an error reading from the file", async () => {
    (readFromFile as jest.Mock).mockRejectedValue(new Error("File read error"));

    const response = await request(app).get("/api/courses/1/modules/1/lessons");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error" });
  });
});
