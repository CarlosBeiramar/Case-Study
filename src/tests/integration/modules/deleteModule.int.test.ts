import request from "supertest";
import app from "../../../app";
import { coursesFilePath, readFromFile, writeToFile, moduleFilePath, lessonsFilePath} from '../../../utils/FileHandlers';


jest.mock("../../../utils/FileHandlers");

describe("DELETE /api/courses/:courseId/modules/:moduleId", () => {
  const sampleCourse = {
    id: 1,
    title: "Sample Course",
    modules: [{ id: 1, title: "Sample Module", lessons: [] }],
  };

  const sampleModules = [{ id: 1, title: "Sample Module", lessons: [] }];

  beforeEach(() => {
    (readFromFile as jest.Mock).mockReset();
    (writeToFile as jest.Mock).mockReset();
  });

  it("should delete a module successfully and return 200 status", async () => {
    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([sampleCourse])
      .mockResolvedValueOnce(sampleModules);

    const response = await request(app).delete("/api/courses/1/modules/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Deleted Successfully." });

    expect(writeToFile).toHaveBeenCalledWith(moduleFilePath, []);
    expect(writeToFile).toHaveBeenCalledWith(coursesFilePath, [
      { ...sampleCourse, modules: [] },
    ]);
  });

  it("should return a 404 status if the module is not found in module data", async () => {
    (readFromFile as jest.Mock)
      .mockResolvedValueOnce([sampleCourse])
      .mockResolvedValueOnce([]);

    const response = await request(app).delete("/api/courses/1/modules/1");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Module not found." });
  });

  it("should return a 500 status if there is an error reading or writing the file", async () => {
    (readFromFile as jest.Mock).mockRejectedValue(new Error("File read error"));

    const response = await request(app).delete("/api/courses/1/modules/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error." });
  });
});
