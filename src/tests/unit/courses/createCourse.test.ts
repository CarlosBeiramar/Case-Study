import { Request, Response } from 'express';
import { createCourse } from '../../../controllers/courseController';
import { readFromFile } from "../../../utils/FileHandlers";
import { Course } from '../../../models/Course';
import { Module } from '../../../models/Module';
import { Lesson } from '../../../models/Lesson';

jest.mock("../../../utils/FileHandlers", () => ({
    readFromFile: jest.fn(),
  }));

describe("createCourse", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        title: "New Course",
        description: "A description for the new course",
        modules: [
          {
            title: "New Module",
            lessons: [
              {
                title: "New Lesson",
                description: "Lesson description",
                topics: ["Topic 1", "Topic 2"],
                content: [{ type: "text", data: "Lesson content" }]
              }
            ]
          }
        ]
      }
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle errors and return 500", () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    createCourse(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Internal Server Error." });
  });
});
