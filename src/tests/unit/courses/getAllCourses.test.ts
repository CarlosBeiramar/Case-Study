import { Request, Response } from "express";
import { getAllCourses } from "../../../controllers/courseController";
import { readFromFile, coursesFilePath } from "../../../utils/FileHandlers";

jest.mock("../../../utils/FileHandlers", () => ({
  readFromFile: jest.fn(),
}));

describe("getAllCourses", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { query: { page: "1", limit: "2" } }; // Default page and limit for pagination tests
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated courses with a 200 status when courses are available", () => {
    const mockCourses = [
      { id: 1, title: "Course 1", description: "Description 1" },
      { id: 2, title: "Course 2", description: "Description 2" },
      { id: 3, title: "Course 3", description: "Description 3" },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    getAllCourses(req as Request, res as Response);

    expect(readFromFile).toHaveBeenCalledWith(coursesFilePath);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      page: 1,
      limit: 2,
      totalCourses: mockCourses.length,
      courses: mockCourses.slice(0, 2),
    });
  });

  it("should return a 404 status with an error message if no courses are found", () => {
    (readFromFile as jest.Mock).mockReturnValue([]);

    getAllCourses(req as Request, res as Response);

    expect(readFromFile).toHaveBeenCalledWith(coursesFilePath);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Course not found." });
  });

  it("should handle a custom page and limit in the request query", () => {
    const mockCourses = [
      { id: 1, title: "Course 1", description: "Description 1" },
      { id: 2, title: "Course 2", description: "Description 2" },
      { id: 3, title: "Course 3", description: "Description 3" },
      { id: 4, title: "Course 4", description: "Description 4" },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);
    req.query = { page: "2", limit: "2" };

    getAllCourses(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      page: 2,
      limit: 2,
      totalCourses: mockCourses.length,
      courses: mockCourses.slice(2, 4),
    });
  });

  it("should return a 500 status with an error message on unexpected errors", () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected Error");
    });

    getAllCourses(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal Server Error.");
  });
});
