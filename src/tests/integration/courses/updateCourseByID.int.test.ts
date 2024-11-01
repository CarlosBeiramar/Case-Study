import request from 'supertest';
import app from '../../../app';
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';

jest.mock("../../../utils/FileHandlers");

describe("PUT /api/courses/:id", () => {
  const existingCourse = {
    id: 1,
    title: "Existing Course",
    description: "Existing description",
    modules: [],
  };

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
    (writeToFile as jest.Mock).mockReset();
    (readFromFile as jest.Mock).mockResolvedValueOnce([existingCourse]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update a course successfully and return a 204 status", async () => {
    const updatedCourse = {
      title: "Updated Course Title",
      description: "Updated description",
      modules: []
    };

    const response = await request(app)
      .put("/api/courses/1")
      .send(updatedCourse);

    expect(response.status).toBe(204);
    expect(writeToFile).toHaveBeenCalledWith(coursesFilePath, expect.anything());

    const updatedCourses = (writeToFile as jest.Mock).mock.calls[0][1];
    expect(updatedCourses[0].title).toBe(updatedCourse.title);
  });

  it("should return a 404 status if the course does not exist", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app)
      .put("/api/courses/999")
      .send({ title: "Some Title" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course not found" });
  });
});
