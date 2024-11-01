import { Request, Response } from 'express';
import { getCourseById } from "../../../controllers/courseController";
import { readFromFile, coursesFilePath } from "../../../utils/FileHandlers";
import { Course } from 'src/models/Course';

jest.mock("../../../utils/FileHandlers", () => ({
    readFromFile: jest.fn(),
  }));

describe("getCourseById", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = { params: { courseId: '1' } };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the course with the specified ID", async () => {
    const courseId = 1;
    const mockCourse: Course = { id: courseId, title: "Sample Course", description: "A sample course", modules: [] };
    const mockData: Course[] = [mockCourse];

    (readFromFile as jest.Mock).mockReturnValue(mockData);

    await getCourseById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockCourse);
  });

  it("should return 404 if the course is not found", async () => {
    const mockData: Course[] = [{ id: 2, title: "Another Course", description: "Another sample course", modules: [] }];

    (readFromFile as jest.Mock).mockReturnValue(mockData);

    await getCourseById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Course not found" });
  });

  it("should return 500 if there is an error reading the file", async () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    await getCourseById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
