import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';


jest.mock("../../../utils/FileHandlers");

describe("DELETE /api/courses/:courseId/modules/:moduleId/lessons/:lessonId", () => {
  const sampleCourse = {
    id: 1,
    title: "Sample Course",
    modules: [
      {
        id: 1,
        title: "Sample Module",
        lessons: [
          {
            id: 1,
            title: "Sample Lesson",
            description: "Lesson description",
            topics: ["Topic 1", "Topic 2"],
            content: ["Lesson content"],
          },
        ],
      },
    ],
  };

  const lessonToDelete = sampleCourse.modules[0].lessons[0];

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
    (writeToFile as jest.Mock).mockReset();
  });

  it("should return a 404 status if the lesson is not found", async () => {
    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([sampleCourse])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(sampleCourse.modules);

    const response = await request(app).delete("/api/courses/1/modules/1/lessons/99");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Lesson not found." });
    expect(writeToFile).not.toHaveBeenCalled();
  });

  it("should return a 404 status if the module is not found", async () => {
    const courseWithoutModule = {
      ...sampleCourse,
      modules: [],
    };

    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([courseWithoutModule])
      .mockResolvedValueOnce([lessonToDelete])
      .mockResolvedValueOnce([]);

    const response = await request(app).delete("/api/courses/1/modules/99/lessons/1");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Module not found." });
    expect(writeToFile).not.toHaveBeenCalled();
  });

  it("should return a 404 status if the course is not found", async () => {
    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([lessonToDelete])
      .mockResolvedValueOnce(sampleCourse.modules);

    const response = await request(app).delete("/api/courses/99/modules/1/lessons/1");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course not found." });
    expect(writeToFile).not.toHaveBeenCalled();
  });
});
