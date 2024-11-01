import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile } from '../../../utils/FileHandlers';

jest.mock("../../../utils/FileHandlers");

describe("DELETE /api/courses/:courseId", () => {
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

  it("should delete a course successfully and return a 200 status", async () => {
    const response = await request(app).delete("/api/courses/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Deleted successfully." });
    expect(writeToFile).toHaveBeenCalledWith(coursesFilePath, expect.anything());

    const remainingCourses = (writeToFile as jest.Mock).mock.calls[0][1];
    expect(remainingCourses).toEqual([]);
  });

  it("should return a 404 status if the course does not exist", async () => {
    (readFromFile as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).delete("/api/courses/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course not found" });
  });

  it("should return a 500 status if there is an error writing to file", async () => {
    (writeToFile as jest.Mock).mockImplementation(() => {
      throw new Error("File write error");
    });

    const response = await request(app).delete("/api/courses/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error." });
  });
});
