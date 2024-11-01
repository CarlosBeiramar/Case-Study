import request from "supertest";
import app from '../../../app';
import { coursesFilePath, readFromFile } from "../../../utils/FileHandlers";
import fs from 'fs';

jest.mock("../../../utils/FileHandlers", () => ({
  readFromFile: jest.fn(),
}));

describe("GET /api/courses/:id", () => {
  const mockCourses = [
    { id: 1, title: "Course 1", description: "Description 1" },
    { id: 2, title: "Course 2", description: "Description 2" },
    { id: 3, title: "Course 3", description: "Description 3" },
  ];

  beforeEach(() => {
    (readFromFile as jest.Mock).mockResolvedValue(mockCourses);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a course by ID with a 200 status", async () => {
    const courseId = 1;

    const response = await request(app).get(`/api/courses/${courseId}`);

    expect(readFromFile).toHaveBeenCalledWith(coursesFilePath);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCourses.find((c) => c.id === courseId));
  });

  it("should return a 404 status with an error message if the course is not found", async () => {
    const courseId = 999;

    const response = await request(app).get(`/api/courses/${courseId}`);

    expect(readFromFile).toHaveBeenCalledWith(coursesFilePath);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course not found" });
  });

  it("should return a 500 status with an error message if an error occurs", async () => {
    (readFromFile as jest.Mock).mockRejectedValue(new Error("Unexpected Error"));

    const courseId = 1;

    const response = await request(app).get(`/api/courses/${courseId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal Server Error" });
  });
});
