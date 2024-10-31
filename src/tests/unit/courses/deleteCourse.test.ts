import { Request, Response } from 'express';
import { deleteCourse } from '../../../controllers/courseController';
import { readFromFile, coursesFilePath, writeToFile } from "../../../utils/FileHandlers";
import { Course } from '../../../models/Course';

jest.mock('../../../utils/FileHandlers');

describe("deleteCourse", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      params: { id: '1' },
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete the course when found", () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Old Title", description: "Old Description", modules: [] },
      { id: 2, title: "Another Course", description: "Another Description", modules: [] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);
    (writeToFile as jest.Mock).mockImplementation(() => {});

    deleteCourse(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Deleted successfully." });
    expect(mockCourses.length).toBe(1); // Check if the course has been removed
    expect(writeToFile).toHaveBeenCalledWith(coursesFilePath, mockCourses);
  });

  it("should return 404 if the course is not found", () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Old Title", description: "Old Description", modules: [] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    req.params.id = '2'; // Course ID that does not exist

    deleteCourse(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Course not found" });
  });

  it("should handle errors and return 500", () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    deleteCourse(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Internal Server Error." });
  });
});