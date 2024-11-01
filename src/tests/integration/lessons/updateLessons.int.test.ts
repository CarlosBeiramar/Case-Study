import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';


jest.mock("../../../utils/FileHandlers");

describe("PUT /api/courses/:courseId/modules/:moduleId/lessons/:lessonId", () => {
  const sampleCourse = {
    id: 1,
    title: "Sample Course",
    description: "Course description",
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
            content:["Lesson content"],
          },
        ],
      },
    ],
  };

  const updatedLessonData = {
    title: "Updated Lesson",
    description: "Updated description",
    topics: ["Updated Topic 1"],
    content: ["Updated content"],
  };

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
    (writeToFile as jest.Mock).mockReset();
  });

  it("should successfully update a lesson and return a 204 status", async () => {
    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([sampleCourse])
      .mockResolvedValueOnce([sampleCourse.modules[0].lessons[0]])
      .mockResolvedValueOnce(sampleCourse.modules);

    const response = await request(app)
      .put("/api/courses/1/modules/1/lessons/1")
      .send(updatedLessonData);

    expect(response.status).toBe(204);

    expect(writeToFile).toHaveBeenCalledTimes(3);
    expect(writeToFile).toHaveBeenCalledWith(lessonsFilePath, expect.any(Array));
    expect(writeToFile).toHaveBeenCalledWith(moduleFilePath, expect.any(Array));
    expect(writeToFile).toHaveBeenCalledWith(coursesFilePath, expect.any(Array));
  });

  it("should return a 404 status if the lesson is not found", async () => {
    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([sampleCourse])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(sampleCourse.modules);

    const response = await request(app)
      .put("/api/courses/1/modules/1/lessons/99")
      .send(updatedLessonData);

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
      .mockResolvedValueOnce([sampleCourse.modules[0].lessons[0]])
      .mockResolvedValueOnce([]);

    const response = await request(app)
      .put("/api/courses/1/modules/99/lessons/1")
      .send(updatedLessonData);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Module not found." });
    expect(writeToFile).not.toHaveBeenCalled();
  });

  it("should return a 404 status if the course is not found", async () => {
    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleCourse.modules[0].lessons[0]])
      .mockResolvedValueOnce(sampleCourse.modules);

    const response = await request(app)
      .put("/api/courses/99/modules/1/lessons/1")
      .send(updatedLessonData);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course not found." });
    expect(writeToFile).not.toHaveBeenCalled();
  });

  it("should return a 500 status if there is an error reading the files", async () => {
    (readFromFile as jest.Mock).mockRejectedValue(new Error("File read error"));

    const response = await request(app)
      .put("/api/courses/1/modules/1/lessons/1")
      .send(updatedLessonData);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error." });
  });
});
